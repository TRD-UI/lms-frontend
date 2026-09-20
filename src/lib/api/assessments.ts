import { supabase } from "@/lib/supabase";
import type {
    Assessment,
    AssessmentAttempt,
    AssessmentQuestion,
    AttemptAnswer,
    GradedQuestion,
} from "@/data/assessment-types";

/**
 * Assessment data access.
 *
 * Two audiences with deliberately different reach. An instructor reads
 * questions and options straight off the tables, because RLS lets the course's
 * owner see them. A learner cannot — the answer key is revoked at the column
 * level — so their questions arrive only from `start_attempt`, and their
 * results only from `attempt_result`. Both grade server-side.
 */

const ASSESSMENT_SELECT = `
  id, course_id, module_id, title, description, kind, status,
  passing_score, time_limit_minutes, max_attempts, gates_entry_pass,
  created_by, updated_at,
  assessment_questions (
    id, prompt, type, explanation, difficulty, points, tags,
    remedial_module_id, position,
    question_options ( id, label, position )
  )
`;

type QuestionRow = {
    id: string;
    prompt: string;
    type: AssessmentQuestion["type"];
    explanation: string | null;
    difficulty: AssessmentQuestion["difficulty"];
    points: number;
    tags: string[];
    remedial_module_id: string | null;
    position: number;
    question_options: { id: string; label: string; position: number }[];
};

type AssessmentRow = {
    id: string;
    course_id: string;
    module_id: string | null;
    title: string;
    description: string;
    kind: Assessment["kind"];
    status: Assessment["status"];
    passing_score: number;
    time_limit_minutes: number;
    max_attempts: number;
    gates_entry_pass: boolean;
    created_by: string | null;
    updated_at: string;
    assessment_questions: QuestionRow[];
};

function toQuestion(q: QuestionRow, correctByQuestion: Map<string, string[]>): AssessmentQuestion {
    return {
        id: q.id,
        prompt: q.prompt,
        type: q.type,
        options: [...(q.question_options ?? [])]
            .sort((a, b) => a.position - b.position)
            .map((o) => ({ id: o.id, label: o.label })),
        // Empty for a learner — `is_correct` is not readable to them, and the
        // quiz runner never needs it because grading happens server-side.
        correctOptionIds: correctByQuestion.get(q.id) ?? [],
        explanation: q.explanation ?? undefined,
        difficulty: q.difficulty,
        points: q.points,
        tags: q.tags ?? [],
        remedialModuleId: q.remedial_module_id ?? undefined,
    };
}

function toAssessment(row: AssessmentRow, correctByQuestion: Map<string, string[]>): Assessment {
    return {
        id: row.id,
        courseId: row.course_id,
        moduleId: row.module_id ?? undefined,
        title: row.title,
        description: row.description,
        kind: row.kind,
        status: row.status,
        passingScore: row.passing_score,
        timeLimitMinutes: row.time_limit_minutes,
        maxAttempts: row.max_attempts,
        gatesEntryPass: row.gates_entry_pass,
        questions: [...(row.assessment_questions ?? [])]
            .sort((a, b) => a.position - b.position)
            .map((q) => toQuestion(q, correctByQuestion)),
        createdBy: row.created_by ?? "",
        updatedAt: row.updated_at,
    };
}

export async function fetchAssessments(): Promise<Assessment[]> {
    const { data, error } = await supabase
        .from("assessments")
        .select(ASSESSMENT_SELECT)
        .order("created_at", { ascending: true });
    if (error) throw error;

    const rows = (data ?? []) as unknown as AssessmentRow[];

    // The answer key is a separate, privileged read. It succeeds for the
    // course's instructor and for an admin, and returns nothing otherwise —
    // which is exactly the learner's view.
    const correctByQuestion = new Map<string, string[]>();
    const keyed = await Promise.all(
        rows.map(async (r) => {
            const { data: payload } = await supabase.rpc("assessment_authoring_payload", {
                p_assessment_id: r.id,
            });
            return payload as unknown as
                | { id: string; options: { id: string; isCorrect: boolean }[] }[]
                | null;
        })
    );
    for (const questions of keyed) {
        for (const q of questions ?? []) {
            correctByQuestion.set(
                q.id,
                (q.options ?? []).filter((o) => o.isCorrect).map((o) => o.id)
            );
        }
    }

    return rows.map((r) => toAssessment(r, correctByQuestion));
}

// ─── Authoring ───────────────────────────────────────────────────────────────

export interface AssessmentInput {
    courseId: string;
    moduleId?: string;
    title: string;
    description: string;
    kind: Assessment["kind"];
    status: Assessment["status"];
    passingScore: number;
    timeLimitMinutes: number;
    maxAttempts: number;
    gatesEntryPass: boolean;
}

const assessmentColumns = (input: Partial<AssessmentInput>) => ({
    ...(input.courseId !== undefined ? { course_id: input.courseId } : {}),
    ...(input.moduleId !== undefined ? { module_id: input.moduleId || null } : {}),
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.kind !== undefined ? { kind: input.kind } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.passingScore !== undefined ? { passing_score: input.passingScore } : {}),
    ...(input.timeLimitMinutes !== undefined ? { time_limit_minutes: input.timeLimitMinutes } : {}),
    ...(input.maxAttempts !== undefined ? { max_attempts: input.maxAttempts } : {}),
    ...(input.gatesEntryPass !== undefined ? { gates_entry_pass: input.gatesEntryPass } : {}),
});

export async function createAssessment(input: AssessmentInput): Promise<string> {
    const { data: me } = await supabase.auth.getUser();
    const { data, error } = await supabase
        .from("assessments")
        .insert({ ...assessmentColumns(input), created_by: me.user?.id ?? null } as never)
        .select("id")
        .single();
    if (error) throw error;
    return data.id;
}

export async function updateAssessment(id: string, patch: Partial<AssessmentInput>) {
    const { error } = await supabase
        .from("assessments")
        .update(assessmentColumns(patch) as never)
        .eq("id", id);
    if (error) throw error;
}

export async function deleteAssessment(id: string) {
    const { error } = await supabase.from("assessments").delete().eq("id", id);
    if (error) throw error;
}

// ─── Questions ───────────────────────────────────────────────────────────────

export interface QuestionInput {
    prompt: string;
    type: AssessmentQuestion["type"];
    options: { label: string; isCorrect: boolean }[];
    explanation?: string;
    points: number;
    remedialModuleId?: string;
}

async function writeOptions(questionId: string, options: QuestionInput["options"]) {
    await supabase.from("question_options").delete().eq("question_id", questionId);
    const { error } = await supabase.from("question_options").insert(
        options.map((o, i) => ({
            question_id: questionId,
            label: o.label,
            is_correct: o.isCorrect,
            position: i,
        }))
    );
    if (error) throw error;
}

export async function addQuestion(assessmentId: string, input: QuestionInput, position: number) {
    const { data, error } = await supabase
        .from("assessment_questions")
        .insert({
            assessment_id: assessmentId,
            prompt: input.prompt,
            type: input.type,
            explanation: input.explanation ?? null,
            points: input.points,
            remedial_module_id: input.remedialModuleId || null,
            position,
        })
        .select("id")
        .single();
    if (error) throw error;
    await writeOptions(data.id, input.options);
}

export async function updateQuestion(id: string, input: QuestionInput) {
    const { error } = await supabase
        .from("assessment_questions")
        .update({
            prompt: input.prompt,
            type: input.type,
            explanation: input.explanation ?? null,
            points: input.points,
            remedial_module_id: input.remedialModuleId || null,
        })
        .eq("id", id);
    if (error) throw error;
    await writeOptions(id, input.options);
}

export async function deleteQuestion(id: string) {
    const { error } = await supabase.from("assessment_questions").delete().eq("id", id);
    if (error) throw error;
}

// ─── Attempts ────────────────────────────────────────────────────────────────

type AttemptRow = {
    id: string;
    assessment_id: string;
    course_id: string;
    student_id: string;
    attempt_number: number;
    score: number | null;
    points_earned: number | null;
    points_possible: number | null;
    passed: boolean | null;
    started_at: string;
    submitted_at: string | null;
    duration_seconds: number | null;
};

function toAttempt(row: AttemptRow, studentName = ""): AssessmentAttempt {
    return {
        id: row.id,
        assessmentId: row.assessment_id,
        courseId: row.course_id,
        studentId: row.student_id,
        studentName,
        answers: [],
        score: row.score ?? 0,
        pointsEarned: row.points_earned ?? 0,
        pointsPossible: row.points_possible ?? 0,
        passed: row.passed ?? false,
        submittedAt: row.submitted_at ?? row.started_at,
        durationSeconds: row.duration_seconds ?? 0,
        attemptNumber: row.attempt_number,
    };
}

/** Submitted attempts the caller may see: their own, plus their courses'. */
export async function fetchAttempts(): Promise<AssessmentAttempt[]> {
    const { data, error } = await supabase
        .from("assessment_attempts")
        .select("*, student:profiles!assessment_attempts_student_id_fkey ( name )")
        .not("submitted_at", "is", null)
        .order("submitted_at", { ascending: false });
    if (error) throw error;
    return ((data ?? []) as unknown as (AttemptRow & { student: { name: string } | null })[]).map((r) =>
        toAttempt(r, r.student?.name ?? "")
    );
}

export interface StartedAttempt {
    attemptId: string;
    attemptNumber: number;
    startedAt: string;
    timeLimitMinutes: number;
    passingScore: number;
    questions: AssessmentQuestion[];
}

/**
 * Opens an attempt. The questions come back without the answer key, the cap is
 * enforced server-side, and an attempt already open is resumed rather than
 * burning another.
 */
export async function startAttempt(assessmentId: string): Promise<StartedAttempt> {
    const { data, error } = await supabase.rpc("start_attempt", { p_assessment_id: assessmentId });
    if (error) throw error;

    const payload = data as unknown as {
        attemptId: string;
        attemptNumber: number;
        startedAt: string;
        timeLimitMinutes: number;
        passingScore: number;
        questions: {
            id: string;
            prompt: string;
            type: AssessmentQuestion["type"];
            points: number;
            tags: string[];
            difficulty: AssessmentQuestion["difficulty"];
            options: { id: string; label: string }[];
        }[];
    };

    return {
        attemptId: payload.attemptId,
        attemptNumber: payload.attemptNumber,
        startedAt: payload.startedAt,
        timeLimitMinutes: payload.timeLimitMinutes,
        passingScore: payload.passingScore,
        questions: (payload.questions ?? []).map((q) => ({
            id: q.id,
            prompt: q.prompt,
            type: q.type,
            options: q.options ?? [],
            correctOptionIds: [],
            difficulty: q.difficulty,
            points: q.points,
            tags: q.tags ?? [],
        })),
    };
}

export async function submitAttempt(attemptId: string, answers: AttemptAnswer[]) {
    const { data, error } = await supabase.rpc("submit_attempt", {
        p_attempt_id: attemptId,
        p_answers: answers.map((a) => ({
            questionId: a.questionId,
            selectedOptionIds: a.selectedOptionIds,
        })) as never,
    });
    if (error) throw error;
    return data as unknown as {
        attemptId: string;
        score: number;
        passed: boolean;
        pointsEarned: number;
        pointsPossible: number;
        attemptNumber: number;
        submittedAt: string;
    };
}

export interface AttemptResult {
    attempt: AssessmentAttempt;
    graded: GradedQuestion[];
}

/** Per-question outcome with the key revealed — readable only after submission. */
export async function fetchAttemptResult(attemptId: string): Promise<AttemptResult> {
    const { data, error } = await supabase.rpc("attempt_result", { p_attempt_id: attemptId });
    if (error) throw error;

    const payload = data as unknown as {
        attempt: AttemptRow;
        graded: {
            id: string;
            prompt: string;
            type: AssessmentQuestion["type"];
            explanation: string | null;
            difficulty: AssessmentQuestion["difficulty"];
            points: number;
            tags: string[];
            remedial_module_id: string | null;
            correct: boolean | null;
            points_earned: number | null;
            selected_option_ids: string[];
            options: { id: string; label: string; isCorrect: boolean }[];
        }[];
    };

    return {
        attempt: toAttempt(payload.attempt),
        graded: (payload.graded ?? []).map((g) => ({
            question: {
                id: g.id,
                prompt: g.prompt,
                type: g.type,
                options: (g.options ?? []).map((o) => ({ id: o.id, label: o.label })),
                correctOptionIds: (g.options ?? []).filter((o) => o.isCorrect).map((o) => o.id),
                explanation: g.explanation ?? undefined,
                difficulty: g.difficulty,
                points: g.points,
                tags: g.tags ?? [],
                remedialModuleId: g.remedial_module_id ?? undefined,
            },
            selectedOptionIds: g.selected_option_ids ?? [],
            correct: g.correct ?? false,
            pointsEarned: g.points_earned ?? 0,
        })),
    };
}
