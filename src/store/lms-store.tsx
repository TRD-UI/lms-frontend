import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/store/session";
import * as coursesApi from "@/lib/api/courses";
import { fetchInstructors } from "@/lib/api/people";
import * as assessmentsApi from "@/lib/api/assessments";
import * as classesApi from "@/lib/api/classes";
import * as referenceApi from "@/lib/api/reference";
import * as notificationsApi from "@/lib/api/notifications";
import {
    earliestSchedulableDate,
    formatSessionDate,
    latestSchedulableDate,
    toDateKey,
    type ClassSession,
} from "@/data/classes";
import type { Notification } from "@/data/notifications";
import type { EntryPass } from "@/data/entry-passes";

import type { Course, CourseModule, ModuleItem } from "@/data/types";
import type { Venue } from "@/lib/api/reference";

export type { Venue };
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

export interface InstructorOption {
    id: string;
    name: string;
}

interface LmsContextValue {
    courses: Course[];
    /** True on first load only; mutations refetch in the background. */
    coursesLoading: boolean;
    coursesError: Error | null;
    refetchCourses: () => void;
    assessments: Assessment[];
    attempts: AssessmentAttempt[];

    // ─── Courses ───
    createCourse: (
        input: Omit<Course, "id" | "modules"> & { modules?: CourseModule[]; id?: string }
    ) => Promise<Course>;
    updateCourse: (id: string, patch: Partial<Course>) => Promise<void>;
    deleteCourse: (id: string) => Promise<void>;
    getCourse: (id: string) => Course | undefined;
    coursesByInstructor: (instructorId: string) => Course[];

    // ─── Modules and items ───
    addModule: (courseId: string, title: string) => Promise<void>;
    updateModule: (courseId: string, moduleId: string, patch: Partial<CourseModule>) => Promise<void>;
    deleteModule: (courseId: string, moduleId: string) => Promise<void>;
    moveModule: (courseId: string, moduleId: string, direction: -1 | 1) => Promise<void>;
    addModuleItem: (courseId: string, moduleId: string, item: Omit<ModuleItem, "id">) => Promise<void>;
    updateModuleItem: (courseId: string, moduleId: string, itemId: string, patch: Partial<ModuleItem>) => Promise<void>;
    deleteModuleItem: (courseId: string, moduleId: string, itemId: string) => Promise<void>;
    moveModuleItem: (courseId: string, moduleId: string, itemId: string, direction: -1 | 1) => Promise<void>;

    // ─── Reference data (admin-managed) ───
    categories: string[];
    addCategory: (name: string) => Promise<void>;
    deleteCategory: (name: string) => Promise<void>;
    venues: Venue[];
    addVenue: (name: string, capacity: number) => Promise<void>;
    updateVenue: (id: string, patch: Partial<Venue>) => Promise<void>;
    deleteVenue: (id: string) => Promise<void>;
    instructors: InstructorOption[];

    // ─── Physical classes ───
    classSessions: ClassSession[];
    /** Rejects a date inside the notice window; returns the created session. */
    scheduleClass: (input: Omit<ClassSession, "id">) => Promise<ClassSession>;
    updateClassSession: (id: string, patch: Partial<ClassSession>) => Promise<void>;
    cancelClassSession: (id: string) => Promise<void>;
    sessionsForInstructor: (instructorId: string) => ClassSession[];
    sessionsForCourses: (courseIds: string[]) => ClassSession[];

    /** Course ids the signed-in learner is enrolled on. */
    enrolledCourseIds: string[];

    // ─── Entry passes ───
    entryPasses: EntryPass[];
    passesForStudent: (studentId: string) => EntryPass[];

    // ─── Notifications ───
    notifications: Notification[];
    markNotificationRead: (id: string) => Promise<void>;
    markAllNotificationsRead: () => Promise<void>;

    // ─── Assessments ───
    createAssessment: (input: Omit<Assessment, "id" | "questions"> & { questions?: AssessmentQuestion[] }) => Promise<Assessment>;
    updateAssessment: (id: string, patch: Partial<Assessment>) => Promise<void>;
    deleteAssessment: (id: string) => Promise<void>;
    duplicateAssessment: (id: string) => Promise<Assessment | undefined>;
    getAssessment: (id: string) => Assessment | undefined;
    assessmentsForCourse: (courseId: string) => Assessment[];

    // ─── Questions ───
    addQuestion: (assessmentId: string, question: Omit<AssessmentQuestion, "id">) => Promise<void>;
    updateQuestion: (assessmentId: string, questionId: string, patch: Partial<AssessmentQuestion>) => Promise<void>;
    deleteQuestion: (assessmentId: string, questionId: string) => Promise<void>;

    // ─── Attempts ───
    /** Opens an attempt and returns its questions, without the answer key. */
    startAttempt: (assessmentId: string) => Promise<assessmentsApi.StartedAttempt>;
    /** Grades server-side and returns the outcome. */
    submitAttempt: (args: { attemptId: string; answers: AttemptAnswer[] }) => Promise<{
        attemptId: string;
        score: number;
        passed: boolean;
        pointsEarned: number;
        pointsPossible: number;
        attemptNumber: number;
        submittedAt: string;
    }>;
    /** Per-question outcome with the key revealed, after submission. */
    fetchAttemptResult: (attemptId: string) => Promise<assessmentsApi.AttemptResult>;
    attemptsFor: (assessmentId: string, studentId: string) => AssessmentAttempt[];
    attemptsForAssessment: (assessmentId: string) => AssessmentAttempt[];
    bestAttempt: (assessmentId: string, studentId: string) => AssessmentAttempt | undefined;
    getAttempt: (attemptId: string) => AssessmentAttempt | undefined;

    /** True when every entry-pass-gating assessment on the course has been passed. */
    entryPassUnlocked: (courseId: string, studentId: string) => boolean;
}

const LmsContext = createContext<LmsContextValue | null>(null);

export function LmsProvider({ children }: { children: React.ReactNode }) {
    /*
     * Every read below is behind RLS, and RLS with no JWT is not an error — it
     * is an empty result. If a query fires before the session has been
     * restored, it succeeds with zero rows and staleTime then caches that
     * emptiness: a venue list that stays blank for five minutes even though
     * six venues exist.
     *
     * So nothing fetches until the session has settled.
     */
    const { status: sessionStatus } = useSession();
    const isReady = sessionStatus === "authenticated";

    // Courses now come from Supabase. Everything else in this store is still
    // seeded, so the two are bridged here rather than at every call site.
    const queryClient = useQueryClient();
    const {
        data: courses = [],
        isLoading: coursesLoading,
        error: coursesError,
    } = useQuery({
        queryKey: ["courses"],
        queryFn: coursesApi.fetchCourses,
        staleTime: 30_000,
        enabled: isReady,
    });

    // The picker must yield real profile ids: courses.instructor_id is a UUID
    // foreign key, so a seeded short id like "u-2" is rejected outright.
    const { data: instructors = [] } = useQuery({
        queryKey: ["instructors"],
        queryFn: fetchInstructors,
        staleTime: 5 * 60_000,
        enabled: isReady,
    });

    const invalidateCourses = useCallback(() => {
        void queryClient.invalidateQueries({ queryKey: ["courses"] });
    }, [queryClient]);
    const {
        data: assessments = [],
        isLoading: assessmentsLoading,
    } = useQuery({
        queryKey: ["assessments"],
        queryFn: assessmentsApi.fetchAssessments,
        staleTime: 30_000,
        enabled: isReady,
    });

    const { data: attempts = [] } = useQuery({
        queryKey: ["attempts"],
        queryFn: assessmentsApi.fetchAttempts,
        staleTime: 15_000,
        enabled: isReady,
    });

    const { data: classSessions = [] } = useQuery({
        queryKey: ["class-sessions"],
        queryFn: classesApi.fetchClassSessions,
        staleTime: 30_000,
        enabled: isReady,
    });

    // Enrolment decides what a learner sees, so it is read rather than assumed.
    const { data: enrolledCourseIds = [] } = useQuery({
        queryKey: ["my-enrollments"],
        queryFn: coursesApi.fetchMyEnrolledCourseIds,
        staleTime: 60_000,
        enabled: isReady,
    });

    const { data: entryPasses = [] } = useQuery({
        queryKey: ["entry-passes"],
        queryFn: classesApi.fetchEntryPasses,
        staleTime: 30_000,
        enabled: isReady,
    });

    const invalidate = useCallback(
        (...keys: string[]) => {
            for (const key of keys) void queryClient.invalidateQueries({ queryKey: [key] });
        },
        [queryClient]
    );

    const { data: categories = [] } = useQuery({
        queryKey: ["categories"],
        queryFn: referenceApi.fetchCategories,
        staleTime: 5 * 60_000,
        enabled: isReady,
    });

    const { data: venues = [] } = useQuery({
        queryKey: ["venues"],
        queryFn: referenceApi.fetchVenues,
        staleTime: 5 * 60_000,
        enabled: isReady,
    });
    // Rows are written by database triggers, so the client only reads and marks.
    const { data: notifications = [] } = useQuery({
        queryKey: ["notifications"],
        queryFn: notificationsApi.fetchNotifications,
        staleTime: 20_000,
        enabled: isReady,
    });

    // ─── Courses ───────────────────────────────────────────────────
    //
    // Every mutation writes to Supabase and then invalidates the query, so the
    // list reflects what the database actually accepted rather than an
    // optimistic guess that RLS might have rejected.

    /** Domain patch → the column set the API expects. */
    /**
     * Domain patch → the column set the API expects.
     *
     * Keyed by `keyof CourseInput` on purpose: adding a field to CourseInput
     * without mapping it here is a compile error. The cover image was silently
     * dropped for weeks because the previous version was a hand-written object
     * literal that simply forgot it, and nothing failed — the update just did
     * not include the column.
     */
    const COURSE_FIELD_MAP: {
        // Required<> matters: over an optional key a mapped type stays optional,
        // so a missing entry would compile. This forces every field to appear.
        // `id` is excluded deliberately — it identifies the row being updated
        // and is never part of the patch.
        [K in keyof Required<Omit<coursesApi.CourseInput, "id">>]: (
            patch: Partial<Course>
        ) => coursesApi.CourseInput[K] | undefined;
    } = {
        title: (p) => p.title,
        description: (p) => p.description,
        category: (p) => p.category,
        duration: (p) => p.duration,
        location: (p) => p.location,
        seatsTotal: (p) => p.seats?.total,
        fees: (p) => p.fees,
        status: (p) => p.status,
        imageUrl: (p) => p.imageUrl,
        instructorId: (p) => p.instructorId,
    };

    const toCourseInput = (patch: Partial<Course>): Partial<coursesApi.CourseInput> => {
        const out: Partial<coursesApi.CourseInput> = {};
        for (const key of Object.keys(COURSE_FIELD_MAP) as (keyof typeof COURSE_FIELD_MAP)[]) {
            const value = COURSE_FIELD_MAP[key](patch);
            if (value !== undefined) {
                (out as Record<string, unknown>)[key] = value;
            }
        }
        return out;
    };

    const createCourse: LmsContextValue["createCourse"] = useCallback(
        async (input) => {
            const id = await coursesApi.createCourse({
                // The form has already uploaded the cover under this id.
                id: input.id,
                title: input.title,
                description: input.description,
                category: input.category,
                duration: input.duration,
                location: input.location,
                seatsTotal: input.seats?.total ?? 0,
                fees: input.fees,
                status: input.status ?? "draft",
                instructorId: input.instructorId,
            });
            invalidateCourses();
            return { ...input, id, modules: input.modules ?? [] } as Course;
        },
        [invalidateCourses]
    );

    const updateCourse = useCallback(
        async (id: string, patch: Partial<Course>) => {
            await coursesApi.updateCourse(id, toCourseInput(patch));
            invalidateCourses();
        },
        [invalidateCourses]
    );

    const deleteCourse = useCallback(
        async (id: string) => {
            // Covers first: the storage policy needs the course row to still be
            // there to prove ownership, and nothing else would ever clear them.
            await coursesApi.deleteCourseImages(id);
            await coursesApi.deleteCourse(id);
            // assessments.course_id cascades, so they go with the course.
            invalidate("courses", "assessments");
        },
        [invalidateCourses]
    );

    // ─── Modules and items ─────────────────────────────────────────
    //
    // `position` is what the player sorts on, so it is written explicitly
    // rather than inferred from insertion order.

    const findCourse = useCallback((id: string) => courses.find((c) => c.id === id), [courses]);

    const addModule = useCallback(
        async (courseId: string, title: string) => {
            const course = findCourse(courseId);
            await coursesApi.addModule(courseId, title, course?.modules.length ?? 0);
            invalidateCourses();
        },
        [findCourse, invalidateCourses]
    );

    const updateModule = useCallback(
        async (_courseId: string, moduleId: string, patch: Partial<CourseModule>) => {
            if (patch.title !== undefined) await coursesApi.updateModule(moduleId, { title: patch.title });
            invalidateCourses();
        },
        [invalidateCourses]
    );

    const deleteModule = useCallback(
        async (_courseId: string, moduleId: string) => {
            await coursesApi.deleteModule(moduleId);
            invalidateCourses();
        },
        [invalidateCourses]
    );

    const moveModule = useCallback(
        async (courseId: string, moduleId: string, direction: -1 | 1) => {
            const course = findCourse(courseId);
            if (!course) return;
            const i = course.modules.findIndex((m) => m.id === moduleId);
            const j = i + direction;
            if (i < 0 || j < 0 || j >= course.modules.length) return;
            await coursesApi.swapModulePositions(
                { id: course.modules[i].id, position: i },
                { id: course.modules[j].id, position: j }
            );
            invalidateCourses();
        },
        [findCourse, invalidateCourses]
    );

    const addModuleItem = useCallback(
        async (courseId: string, moduleId: string, item: Omit<ModuleItem, "id">) => {
            const course = findCourse(courseId);
            const position = course?.modules.find((m) => m.id === moduleId)?.items.length ?? 0;
            await coursesApi.addModuleItem(moduleId, item, position);
            invalidateCourses();
        },
        [findCourse, invalidateCourses]
    );

    const updateModuleItem = useCallback(
        async (courseId: string, moduleId: string, itemId: string, patch: Partial<ModuleItem>) => {
            const existing = findCourse(courseId)
                ?.modules.find((m) => m.id === moduleId)
                ?.items.find((i) => i.id === itemId);
            if (!existing) return;
            await coursesApi.updateModuleItem(itemId, { ...existing, ...patch });
            invalidateCourses();
        },
        [findCourse, invalidateCourses]
    );

    const deleteModuleItem = useCallback(
        async (_courseId: string, _moduleId: string, itemId: string) => {
            await coursesApi.deleteModuleItem(itemId);
            invalidateCourses();
        },
        [invalidateCourses]
    );

    const moveModuleItem = useCallback(
        async (courseId: string, moduleId: string, itemId: string, direction: -1 | 1) => {
            const items = findCourse(courseId)?.modules.find((m) => m.id === moduleId)?.items;
            if (!items) return;
            const i = items.findIndex((it) => it.id === itemId);
            const j = i + direction;
            if (i < 0 || j < 0 || j >= items.length) return;
            await coursesApi.swapItemPositions(
                { id: items[i].id, position: i },
                { id: items[j].id, position: j }
            );
            invalidateCourses();
        },
        [findCourse, invalidateCourses]
    );

    // ─── Reference data ────────────────────────────────────────────

    const addCategory = useCallback(
        async (name: string) => {
            const clean = name.trim();
            if (!clean) return;
            await referenceApi.addCategory(clean);
            invalidate("categories");
        },
        [invalidate]
    );

    const deleteCategory = useCallback(
        async (name: string) => {
            await referenceApi.deleteCategory(name);
            invalidate("categories");
        },
        [invalidate]
    );

    const addVenue = useCallback(
        async (name: string, capacity: number) => {
            const clean = name.trim();
            if (!clean) return;
            await referenceApi.addVenue(clean, capacity);
            invalidate("venues");
        },
        [invalidate]
    );

    const updateVenue = useCallback(
        async (id: string, patch: Partial<Venue>) => {
            await referenceApi.updateVenue(id, patch);
            invalidate("venues");
        },
        [invalidate]
    );

    const deleteVenue = useCallback(
        async (id: string) => {
            await referenceApi.deleteVenue(id);
            invalidate("venues");
        },
        [invalidate]
    );

    // ─── Notifications ─────────────────────────────────────────────

    const markNotificationRead = useCallback(
        async (id: string) => {
            await notificationsApi.markRead(id);
            invalidate("notifications");
        },
        [invalidate]
    );

    const markAllNotificationsRead = useCallback(async () => {
        await notificationsApi.markAllRead();
        invalidate("notifications");
    }, [invalidate]);

    // ─── Physical classes ──────────────────────────────────────────

    const scheduleClass = useCallback<LmsContextValue["scheduleClass"]>(
        async (input) => {
            // Learners need warning, and the pass has to be issued before the
            // door opens — so a class cannot be created inside the notice
            // window. The picker disables these dates too; this is the backstop.
            if (input.date < toDateKey(earliestSchedulableDate())) {
                throw new Error(
                    `A class must be scheduled at least 3 days ahead. The earliest available date is ${formatSessionDate(
                        toDateKey(earliestSchedulableDate())
                    )}.`
                );
            }

            // There is no ceiling in principle, only the course's own length —
            // a class after the course has ended has nobody left to attend it.
            const target = courses.find((c) => c.id === input.courseId);
            const latest = target ? latestSchedulableDate(target.duration) : undefined;
            if (latest && input.date > toDateKey(latest)) {
                throw new Error(
                    `"${target!.title}" runs for ${target!.duration}, so the latest class date is ${formatSessionDate(
                        toDateKey(latest)
                    )}.`
                );
            }

            const id = await classesApi.createClassSession(input);
            // A database trigger issues the entry passes, so the pass list has
            // to be refetched alongside the sessions.
            // Triggers announce the class and issue the passes, so the
            // notification feed is refetched rather than written to here.
            invalidate("class-sessions", "entry-passes", "notifications");
            return { ...input, id };
        },
        [invalidate, courses]
    );

    const updateClassSession = useCallback(
        async (id: string, patch: Partial<ClassSession>) => {
            await classesApi.updateClassSession(id, patch);
            invalidate("class-sessions", "entry-passes");
        },
        [invalidate]
    );

    const cancelClassSession = useCallback(
        async (id: string) => {
            // entry_passes.session_id cascades, so the passes go with it.
            await classesApi.deleteClassSession(id);
            invalidate("class-sessions", "entry-passes");
        },
        [invalidate]
    );

    // ─── Assessments ───────────────────────────────────────────────

    const createAssessment: LmsContextValue["createAssessment"] = useCallback(
        async (input) => {
            const id = await assessmentsApi.createAssessment({
                courseId: input.courseId,
                moduleId: input.moduleId,
                title: input.title,
                description: input.description,
                kind: input.kind,
                status: input.status,
                passingScore: input.passingScore,
                timeLimitMinutes: input.timeLimitMinutes,
                maxAttempts: input.maxAttempts,
                gatesEntryPass: input.gatesEntryPass,
            });
            invalidate("assessments");
            return { ...input, id, questions: input.questions ?? [] } as Assessment;
        },
        [invalidate]
    );

    const updateAssessment = useCallback(
        async (id: string, patch: Partial<Assessment>) => {
            await assessmentsApi.updateAssessment(id, patch as Partial<assessmentsApi.AssessmentInput>);
            // Publishing or unpublishing changes what a learner may enter.
            invalidate("assessments", "entry-passes");
        },
        [invalidate]
    );

    const deleteAssessment = useCallback(
        async (id: string) => {
            await assessmentsApi.deleteAssessment(id);
            invalidate("assessments");
        },
        [invalidate]
    );

    /** Copies the assessment and its questions as a fresh draft. */
    const duplicateAssessment = useCallback(
        async (id: string) => {
            const source = assessments.find((a) => a.id === id);
            if (!source) return undefined;

            const newId = await assessmentsApi.createAssessment({
                courseId: source.courseId,
                moduleId: source.moduleId,
                title: `${source.title} (copy)`,
                description: source.description,
                kind: source.kind,
                status: "draft",
                passingScore: source.passingScore,
                timeLimitMinutes: source.timeLimitMinutes,
                maxAttempts: source.maxAttempts,
                // Only one assessment should gate a course, so a copy never does.
                gatesEntryPass: false,
            });

            for (const [i, q] of source.questions.entries()) {
                await assessmentsApi.addQuestion(
                    newId,
                    {
                        prompt: q.prompt,
                        type: q.type,
                        options: q.options.map((o) => ({
                            label: o.label,
                            isCorrect: q.correctOptionIds.includes(o.id),
                        })),
                        explanation: q.explanation,
                        points: q.points,
                        remedialModuleId: q.remedialModuleId,
                    },
                    i
                );
            }

            invalidate("assessments");
            return { ...source, id: newId, title: `${source.title} (copy)`, status: "draft" } as Assessment;
        },
        [assessments, invalidate]
    );

    // ─── Questions ─────────────────────────────────────────────────

    /** The form hands back option labels plus a key; the API writes both. */
    const toQuestionInput = (question: Omit<AssessmentQuestion, "id">): assessmentsApi.QuestionInput => ({
        prompt: question.prompt,
        type: question.type,
        options: question.options.map((o) => ({
            label: o.label,
            isCorrect: question.correctOptionIds.includes(o.id),
        })),
        explanation: question.explanation,
        points: question.points,
        remedialModuleId: question.remedialModuleId,
    });

    const addQuestion = useCallback(
        async (assessmentId: string, question: Omit<AssessmentQuestion, "id">) => {
            const position = assessments.find((a) => a.id === assessmentId)?.questions.length ?? 0;
            await assessmentsApi.addQuestion(assessmentId, toQuestionInput(question), position);
            invalidate("assessments");
        },
        [assessments, invalidate]
    );

    const updateQuestion = useCallback(
        async (assessmentId: string, questionId: string, patch: Partial<AssessmentQuestion>) => {
            const existing = assessments
                .find((a) => a.id === assessmentId)
                ?.questions.find((q) => q.id === questionId);
            if (!existing) return;
            await assessmentsApi.updateQuestion(questionId, toQuestionInput({ ...existing, ...patch }));
            invalidate("assessments");
        },
        [assessments, invalidate]
    );

    const deleteQuestion = useCallback(
        async (_assessmentId: string, questionId: string) => {
            await assessmentsApi.deleteQuestion(questionId);
            invalidate("assessments");
        },
        [invalidate]
    );

    // ─── Attempts ──────────────────────────────────────────────────

    const startAttempt = useCallback(
        (assessmentId: string) => assessmentsApi.startAttempt(assessmentId),
        []
    );

    const submitAttempt = useCallback<LmsContextValue["submitAttempt"]>(
        async ({ attemptId, answers }) => {
            const result = await assessmentsApi.submitAttempt(attemptId, answers);
            // Passing a gating assessment releases a pass, server-side.
            invalidate("attempts", "entry-passes");
            return result;
        },
        [invalidate]
    );

    const fetchAttemptResult = useCallback(
        (attemptId: string) => assessmentsApi.fetchAttemptResult(attemptId),
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
            coursesLoading,
            coursesError: (coursesError as Error) ?? null,
            refetchCourses: invalidateCourses,
            assessments,
            attempts,
            createCourse,
            updateCourse,
            deleteCourse,
            getCourse,
            coursesByInstructor: (instructorId: string) =>
                courses.filter((c) => c.instructorId === instructorId),
            addModule,
            updateModule,
            deleteModule,
            moveModule,
            addModuleItem,
            updateModuleItem,
            deleteModuleItem,
            moveModuleItem,
            categories,
            addCategory,
            deleteCategory,
            venues,
            addVenue,
            updateVenue,
            deleteVenue,
            classSessions,
            scheduleClass,
            updateClassSession,
            cancelClassSession,
            sessionsForInstructor: (instructorId: string) =>
                classSessions
                    .filter((c) => c.instructorId === instructorId)
                    .sort((a, b) => a.date.localeCompare(b.date)),
            sessionsForCourses: (courseIds: string[]) => {
                const ids = new Set(courseIds);
                return classSessions
                    .filter((c) => ids.has(c.courseId))
                    .sort((a, b) => a.date.localeCompare(b.date));
            },
            enrolledCourseIds,
            entryPasses,
            passesForStudent: () => entryPasses,
            notifications,
            markNotificationRead,
            markAllNotificationsRead,
            instructors: instructors.map((u) => ({ id: u.id, name: u.name })),
            createAssessment,
            updateAssessment,
            deleteAssessment,
            duplicateAssessment,
            getAssessment,
            assessmentsForCourse,
            addQuestion,
            updateQuestion,
            deleteQuestion,
            startAttempt,
            submitAttempt,
            fetchAttemptResult,
            attemptsFor,
            attemptsForAssessment: (assessmentId: string) =>
                attempts.filter((a) => a.assessmentId === assessmentId),
            bestAttempt,
            getAttempt: (attemptId: string) => attempts.find((a) => a.id === attemptId),
            entryPassUnlocked,
        };
    }, [
        courses,
        coursesLoading,
        coursesError,
        invalidateCourses,
        assessments,
        attempts,
        categories,
        venues,
        classSessions,
        notifications,
        entryPasses,
        enrolledCourseIds,
        instructors,
        scheduleClass,
        updateClassSession,
        cancelClassSession,
        markNotificationRead,
        markAllNotificationsRead,
        addModule,
        updateModule,
        deleteModule,
        moveModule,
        addModuleItem,
        updateModuleItem,
        deleteModuleItem,
        moveModuleItem,
        addCategory,
        deleteCategory,
        addVenue,
        updateVenue,
        deleteVenue,
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
        startAttempt,
        submitAttempt,
        fetchAttemptResult,
    ]);

    return <LmsContext.Provider value={value}>{children}</LmsContext.Provider>;
}

export function useLms() {
    const ctx = useContext(LmsContext);
    if (!ctx) throw new Error("useLms must be used within an LmsProvider");
    return ctx;
}
