/**
 * Assessment domain types.
 *
 * An Assessment belongs to a Course. It may additionally be scoped to a single
 * module (a checkpoint), or gate the physical session entry pass (a
 * prerequisite). Learners produce Attempts; each Attempt is graded immediately
 * against the question's `correctOptionIds`.
 */

export type QuestionType = "single" | "multiple" | "boolean";

export type Difficulty = "easy" | "medium" | "hard";

/** What role the assessment plays in the course. */
export type AssessmentKind = "prerequisite" | "checkpoint" | "final";

export type AssessmentStatus = "published" | "draft";

export interface QuestionOption {
    id: string;
    label: string;
}

export interface AssessmentQuestion {
    id: string;
    prompt: string;
    type: QuestionType;
    options: QuestionOption[];
    /** Multiple ids for `type: "multiple"`; exactly one otherwise. */
    correctOptionIds: string[];
    /** Shown on the results screen after submission. */
    explanation?: string;
    difficulty: Difficulty;
    points: number;
    tags: string[];
    /**
     * Module to send the learner back to when they answer incorrectly.
     * Drives the "smart remediation" links on the results screen.
     */
    remedialModuleId?: string;
}

export interface Assessment {
    id: string;
    courseId: string;
    /** Set when the assessment is a checkpoint for one specific module. */
    moduleId?: string;
    title: string;
    description: string;
    kind: AssessmentKind;
    status: AssessmentStatus;
    /** Percentage (0–100) required to pass. */
    passingScore: number;
    timeLimitMinutes: number;
    /** 0 means unlimited. */
    maxAttempts: number;
    /** Passing this releases the QR entry pass for the physical session. */
    gatesEntryPass: boolean;
    questions: AssessmentQuestion[];
    createdBy: string;
    updatedAt: string;
}

export interface AttemptAnswer {
    questionId: string;
    selectedOptionIds: string[];
}

export interface AssessmentAttempt {
    id: string;
    assessmentId: string;
    courseId: string;
    studentId: string;
    studentName: string;
    answers: AttemptAnswer[];
    /** Percentage (0–100), rounded. */
    score: number;
    pointsEarned: number;
    pointsPossible: number;
    passed: boolean;
    /** ISO-8601. */
    submittedAt: string;
    durationSeconds: number;
    attemptNumber: number;
}

/** Per-question outcome, derived at grading time for the results screen. */
export interface GradedQuestion {
    question: AssessmentQuestion;
    selectedOptionIds: string[];
    correct: boolean;
    pointsEarned: number;
}

export interface GradedAttempt {
    attempt: AssessmentAttempt;
    graded: GradedQuestion[];
}
