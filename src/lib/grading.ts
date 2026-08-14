import type {
    Assessment,
    AssessmentQuestion,
    AttemptAnswer,
    GradedQuestion,
} from "@/data/assessment-types";

/** A question is correct only when the selection matches the key exactly. */
export function isAnswerCorrect(
    question: AssessmentQuestion,
    selectedOptionIds: string[]
): boolean {
    const key = question.correctOptionIds;
    if (selectedOptionIds.length !== key.length) return false;
    const selected = new Set(selectedOptionIds);
    return key.every((id) => selected.has(id));
}

export interface GradeResult {
    graded: GradedQuestion[];
    pointsEarned: number;
    pointsPossible: number;
    /** Percentage 0–100, rounded. */
    score: number;
    passed: boolean;
}

export function gradeAssessment(
    assessment: Assessment,
    answers: AttemptAnswer[]
): GradeResult {
    const byQuestion = new Map(answers.map((a) => [a.questionId, a.selectedOptionIds]));

    const graded: GradedQuestion[] = assessment.questions.map((question) => {
        const selectedOptionIds = byQuestion.get(question.id) ?? [];
        const correct = isAnswerCorrect(question, selectedOptionIds);
        return {
            question,
            selectedOptionIds,
            correct,
            pointsEarned: correct ? question.points : 0,
        };
    });

    const pointsPossible = assessment.questions.reduce((sum, q) => sum + q.points, 0);
    const pointsEarned = graded.reduce((sum, g) => sum + g.pointsEarned, 0);
    const score = pointsPossible === 0 ? 0 : Math.round((pointsEarned / pointsPossible) * 100);

    return {
        graded,
        pointsEarned,
        pointsPossible,
        score,
        passed: score >= assessment.passingScore,
    };
}

/**
 * Modules the learner should revisit, derived from the questions they missed.
 * Drives the "smart remediation" links on the results screen.
 */
export function remedialModuleIds(graded: GradedQuestion[]): string[] {
    const ids = graded
        .filter((g) => !g.correct && g.question.remedialModuleId)
        .map((g) => g.question.remedialModuleId as string);
    return Array.from(new Set(ids));
}

export function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${String(s).padStart(2, "0")}s`;
}
