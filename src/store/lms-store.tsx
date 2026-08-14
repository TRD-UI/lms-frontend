import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { courses as seedCourses } from "@/data/courses";
import { assessments as seedAssessments, seedAttempts } from "@/data/assessments";
import type { Course, CourseModule } from "@/data/types";
import type {
    Assessment,
    AssessmentAttempt,
    AssessmentQuestion,
    AttemptAnswer,
} from "@/data/assessment-types";
import { gradeAssessment } from "@/lib/grading";

/**
 * In-memory LMS store.
 *
 * The app has no backend, so this context is the single source of truth for
 * everything mutable: courses, assessments and attempt history. Every create /
 * update / delete in the admin and instructor portals writes here, and every
 * read goes through the selectors below — so a change made on one screen is
 * visible on all the others. State resets on reload, which is the intended
 * behaviour for a prototype.
 */

let idCounter = 0;
const nextId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${idCounter++}`;

interface LmsContextValue {
    courses: Course[];
    assessments: Assessment[];
    attempts: AssessmentAttempt[];

    // ─── Courses ───
    createCourse: (input: Omit<Course, "id" | "modules"> & { modules?: CourseModule[] }) => Course;
    updateCourse: (id: string, patch: Partial<Course>) => void;
    deleteCourse: (id: string) => void;
    getCourse: (id: string) => Course | undefined;
    coursesByInstructor: (instructorId: string) => Course[];

    // ─── Assessments ───
    createAssessment: (input: Omit<Assessment, "id" | "questions"> & { questions?: AssessmentQuestion[] }) => Assessment;
    updateAssessment: (id: string, patch: Partial<Assessment>) => void;
    deleteAssessment: (id: string) => void;
    duplicateAssessment: (id: string) => Assessment | undefined;
    getAssessment: (id: string) => Assessment | undefined;
    assessmentsForCourse: (courseId: string) => Assessment[];

    // ─── Questions ───
    addQuestion: (assessmentId: string, question: Omit<AssessmentQuestion, "id">) => void;
    updateQuestion: (assessmentId: string, questionId: string, patch: Partial<AssessmentQuestion>) => void;
    deleteQuestion: (assessmentId: string, questionId: string) => void;

    // ─── Attempts ───
    submitAttempt: (args: {
        assessment: Assessment;
        answers: AttemptAnswer[];
        studentId: string;
        studentName: string;
        durationSeconds: number;
    }) => AssessmentAttempt;
    attemptsFor: (assessmentId: string, studentId: string) => AssessmentAttempt[];
    attemptsForAssessment: (assessmentId: string) => AssessmentAttempt[];
    bestAttempt: (assessmentId: string, studentId: string) => AssessmentAttempt | undefined;
    getAttempt: (attemptId: string) => AssessmentAttempt | undefined;

    /** True when every entry-pass-gating assessment on the course has been passed. */
    entryPassUnlocked: (courseId: string, studentId: string) => boolean;
}

const LmsContext = createContext<LmsContextValue | null>(null);

export function LmsProvider({ children }: { children: React.ReactNode }) {
    const [courses, setCourses] = useState<Course[]>(seedCourses);
    const [assessments, setAssessments] = useState<Assessment[]>(seedAssessments);
    const [attempts, setAttempts] = useState<AssessmentAttempt[]>(seedAttempts);

    // ─── Courses ───────────────────────────────────────────────────

    const createCourse: LmsContextValue["createCourse"] = useCallback((input) => {
        const course: Course = { ...input, id: nextId("c"), modules: input.modules ?? [] };
        setCourses((prev) => [course, ...prev]);
        return course;
    }, []);

    const updateCourse = useCallback((id: string, patch: Partial<Course>) => {
        setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    }, []);

    const deleteCourse = useCallback((id: string) => {
        setCourses((prev) => prev.filter((c) => c.id !== id));
        // Assessments cannot outlive their course.
        setAssessments((prev) => prev.filter((a) => a.courseId !== id));
    }, []);

    // ─── Assessments ───────────────────────────────────────────────

    const createAssessment: LmsContextValue["createAssessment"] = useCallback((input) => {
        const assessment: Assessment = {
            ...input,
            id: nextId("as"),
            questions: input.questions ?? [],
        };
        setAssessments((prev) => [assessment, ...prev]);
        return assessment;
    }, []);

    const updateAssessment = useCallback((id: string, patch: Partial<Assessment>) => {
        setAssessments((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
    }, []);

    const deleteAssessment = useCallback((id: string) => {
        setAssessments((prev) => prev.filter((a) => a.id !== id));
    }, []);

    const duplicateAssessment = useCallback((id: string) => {
        let copy: Assessment | undefined;
        setAssessments((prev) => {
            const source = prev.find((a) => a.id === id);
            if (!source) return prev;
            copy = {
                ...source,
                id: nextId("as"),
                title: `${source.title} (copy)`,
                status: "draft",
                questions: source.questions.map((q) => ({ ...q, id: nextId("q") })),
            };
            return [copy, ...prev];
        });
        return copy;
    }, []);

    // ─── Questions ─────────────────────────────────────────────────

    const addQuestion = useCallback((assessmentId: string, question: Omit<AssessmentQuestion, "id">) => {
        setAssessments((prev) =>
            prev.map((a) =>
                a.id === assessmentId
                    ? { ...a, questions: [...a.questions, { ...question, id: nextId("q") }] }
                    : a
            )
        );
    }, []);

    const updateQuestion = useCallback(
        (assessmentId: string, questionId: string, patch: Partial<AssessmentQuestion>) => {
            setAssessments((prev) =>
                prev.map((a) =>
                    a.id === assessmentId
                        ? {
                            ...a,
                            questions: a.questions.map((q) =>
                                q.id === questionId ? { ...q, ...patch } : q
                            ),
                        }
                        : a
                )
            );
        },
        []
    );

    const deleteQuestion = useCallback((assessmentId: string, questionId: string) => {
        setAssessments((prev) =>
            prev.map((a) =>
                a.id === assessmentId
                    ? { ...a, questions: a.questions.filter((q) => q.id !== questionId) }
                    : a
            )
        );
    }, []);

    // ─── Attempts ──────────────────────────────────────────────────

    /**
     * Mirrors `attempts` so a submission can read the prior attempt count and
     * return the graded attempt synchronously — the quiz page navigates straight
     * to the results screen with the returned id.
     */
    const attemptsRef = useRef<AssessmentAttempt[]>(seedAttempts);

    const submitAttempt: LmsContextValue["submitAttempt"] = useCallback(
        ({ assessment, answers, studentId, studentName, durationSeconds }) => {
            const result = gradeAssessment(assessment, answers);
            const priorCount = attemptsRef.current.filter(
                (a) => a.assessmentId === assessment.id && a.studentId === studentId
            ).length;

            const attempt: AssessmentAttempt = {
                id: nextId("at"),
                assessmentId: assessment.id,
                courseId: assessment.courseId,
                studentId,
                studentName,
                answers,
                score: result.score,
                pointsEarned: result.pointsEarned,
                pointsPossible: result.pointsPossible,
                passed: result.passed,
                submittedAt: new Date().toISOString(),
                durationSeconds,
                attemptNumber: priorCount + 1,
            };

            attemptsRef.current = [...attemptsRef.current, attempt];
            setAttempts(attemptsRef.current);
            return attempt;
        },
        []
    );

    // ─── Selectors ─────────────────────────────────────────────────

    const value = useMemo<LmsContextValue>(() => {
        const getCourse = (id: string) => courses.find((c) => c.id === id);
        const getAssessment = (id: string) => assessments.find((a) => a.id === id);
        const assessmentsForCourse = (courseId: string) =>
            assessments.filter((a) => a.courseId === courseId);
        const attemptsFor = (assessmentId: string, studentId: string) =>
            attempts.filter((a) => a.assessmentId === assessmentId && a.studentId === studentId);

        const bestAttempt = (assessmentId: string, studentId: string) =>
            attemptsFor(assessmentId, studentId).reduce<AssessmentAttempt | undefined>(
                (best, a) => (!best || a.score > best.score ? a : best),
                undefined
            );

        const entryPassUnlocked = (courseId: string, studentId: string) => {
            const gates = assessments.filter(
                (a) => a.courseId === courseId && a.gatesEntryPass && a.status === "published"
            );
            if (gates.length === 0) return true;
            return gates.every((g) => bestAttempt(g.id, studentId)?.passed === true);
        };

        return {
            courses,
            assessments,
            attempts,
            createCourse,
            updateCourse,
            deleteCourse,
            getCourse,
            coursesByInstructor: (instructorId: string) =>
                courses.filter((c) => c.instructorId === instructorId),
            createAssessment,
            updateAssessment,
            deleteAssessment,
            duplicateAssessment,
            getAssessment,
            assessmentsForCourse,
            addQuestion,
            updateQuestion,
            deleteQuestion,
            submitAttempt,
            attemptsFor,
            attemptsForAssessment: (assessmentId: string) =>
                attempts.filter((a) => a.assessmentId === assessmentId),
            bestAttempt,
            getAttempt: (attemptId: string) => attempts.find((a) => a.id === attemptId),
            entryPassUnlocked,
        };
    }, [
        courses,
        assessments,
        attempts,
        createCourse,
        updateCourse,
        deleteCourse,
        createAssessment,
        updateAssessment,
        deleteAssessment,
        duplicateAssessment,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        submitAttempt,
    ]);

    return <LmsContext.Provider value={value}>{children}</LmsContext.Provider>;
}

export function useLms() {
    const ctx = useContext(LmsContext);
    if (!ctx) throw new Error("useLms must be used within an LmsProvider");
    return ctx;
}
