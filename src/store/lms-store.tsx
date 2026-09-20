import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { courses as seedCourses, courseCategories as seedCategories } from "@/data/courses";
import { venueUsage as seedVenues, adminUsers } from "@/data/admin";
import {
    classSessions as seedClasses,
    earliestSchedulableDate,
    formatSessionDate,
    toDateKey,
    type ClassSession,
} from "@/data/classes";
import { notifications as seedNotifications, type Notification } from "@/data/notifications";
import { assessments as seedAssessments, seedAttempts } from "@/data/assessments";
import type { Course, CourseModule, ModuleItem } from "@/data/types";
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

export interface Venue {
    id: string;
    name: string;
    capacity: number;
}

export interface InstructorOption {
    id: string;
    name: string;
}

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

    // ─── Modules and items ───
    addModule: (courseId: string, title: string) => CourseModule;
    updateModule: (courseId: string, moduleId: string, patch: Partial<CourseModule>) => void;
    deleteModule: (courseId: string, moduleId: string) => void;
    moveModule: (courseId: string, moduleId: string, direction: -1 | 1) => void;
    addModuleItem: (courseId: string, moduleId: string, item: Omit<ModuleItem, "id">) => void;
    updateModuleItem: (courseId: string, moduleId: string, itemId: string, patch: Partial<ModuleItem>) => void;
    deleteModuleItem: (courseId: string, moduleId: string, itemId: string) => void;
    moveModuleItem: (courseId: string, moduleId: string, itemId: string, direction: -1 | 1) => void;

    // ─── Reference data (admin-managed) ───
    categories: string[];
    addCategory: (name: string) => void;
    deleteCategory: (name: string) => void;
    venues: Venue[];
    addVenue: (name: string, capacity: number) => void;
    updateVenue: (id: string, patch: Partial<Venue>) => void;
    deleteVenue: (id: string) => void;
    instructors: InstructorOption[];

    // ─── Physical classes ───
    classSessions: ClassSession[];
    /** Rejects a date inside the notice window; returns the created session. */
    scheduleClass: (input: Omit<ClassSession, "id">) => ClassSession;
    updateClassSession: (id: string, patch: Partial<ClassSession>) => void;
    cancelClassSession: (id: string) => void;
    sessionsForInstructor: (instructorId: string) => ClassSession[];
    sessionsForCourses: (courseIds: string[]) => ClassSession[];

    // ─── Notifications ───
    notifications: Notification[];
    markNotificationRead: (id: string) => void;
    markAllNotificationsRead: () => void;

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
    const [categories, setCategories] = useState<string[]>(seedCategories);
    const [classSessions, setClassSessions] = useState<ClassSession[]>(seedClasses);
    const [notifications, setNotifications] = useState<Notification[]>(seedNotifications);
    const [venues, setVenues] = useState<Venue[]>(
        seedVenues.map((v) => ({ id: nextId("v"), name: v.venue, capacity: v.capacity }))
    );

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

    // ─── Modules and items ─────────────────────────────────────────
    //
    // All of these narrow to one course and rewrite its `modules` array. The
    // course object is replaced rather than mutated so React sees the change.

    const patchCourse = useCallback(
        (courseId: string, fn: (course: Course) => Course) => {
            setCourses((prev) => prev.map((c) => (c.id === courseId ? fn(c) : c)));
        },
        []
    );

    const addModule = useCallback(
        (courseId: string, title: string) => {
            const module: CourseModule = { id: nextId("m"), title, items: [] };
            patchCourse(courseId, (c) => ({ ...c, modules: [...c.modules, module] }));
            return module;
        },
        [patchCourse]
    );

    const updateModule = useCallback(
        (courseId: string, moduleId: string, patch: Partial<CourseModule>) => {
            patchCourse(courseId, (c) => ({
                ...c,
                modules: c.modules.map((m) => (m.id === moduleId ? { ...m, ...patch } : m)),
            }));
        },
        [patchCourse]
    );

    const deleteModule = useCallback(
        (courseId: string, moduleId: string) => {
            patchCourse(courseId, (c) => ({
                ...c,
                modules: c.modules.filter((m) => m.id !== moduleId),
            }));
        },
        [patchCourse]
    );

    /** Reorders within bounds; a move off either end is a no-op. */
    const moveModule = useCallback(
        (courseId: string, moduleId: string, direction: -1 | 1) => {
            patchCourse(courseId, (c) => {
                const i = c.modules.findIndex((m) => m.id === moduleId);
                const j = i + direction;
                if (i < 0 || j < 0 || j >= c.modules.length) return c;
                const modules = [...c.modules];
                [modules[i], modules[j]] = [modules[j], modules[i]];
                return { ...c, modules };
            });
        },
        [patchCourse]
    );

    const addModuleItem = useCallback(
        (courseId: string, moduleId: string, item: Omit<ModuleItem, "id">) => {
            patchCourse(courseId, (c) => ({
                ...c,
                modules: c.modules.map((m) =>
                    m.id === moduleId ? { ...m, items: [...m.items, { ...item, id: nextId("i") }] } : m
                ),
            }));
        },
        [patchCourse]
    );

    const updateModuleItem = useCallback(
        (courseId: string, moduleId: string, itemId: string, patch: Partial<ModuleItem>) => {
            patchCourse(courseId, (c) => ({
                ...c,
                modules: c.modules.map((m) =>
                    m.id === moduleId
                        ? { ...m, items: m.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)) }
                        : m
                ),
            }));
        },
        [patchCourse]
    );

    const deleteModuleItem = useCallback(
        (courseId: string, moduleId: string, itemId: string) => {
            patchCourse(courseId, (c) => ({
                ...c,
                modules: c.modules.map((m) =>
                    m.id === moduleId ? { ...m, items: m.items.filter((it) => it.id !== itemId) } : m
                ),
            }));
        },
        [patchCourse]
    );

    const moveModuleItem = useCallback(
        (courseId: string, moduleId: string, itemId: string, direction: -1 | 1) => {
            patchCourse(courseId, (c) => ({
                ...c,
                modules: c.modules.map((m) => {
                    if (m.id !== moduleId) return m;
                    const i = m.items.findIndex((it) => it.id === itemId);
                    const j = i + direction;
                    if (i < 0 || j < 0 || j >= m.items.length) return m;
                    const items = [...m.items];
                    [items[i], items[j]] = [items[j], items[i]];
                    return { ...m, items };
                }),
            }));
        },
        [patchCourse]
    );

    // ─── Reference data ────────────────────────────────────────────

    const addCategory = useCallback((name: string) => {
        const clean = name.trim();
        if (!clean) return;
        setCategories((prev) => (prev.includes(clean) ? prev : [...prev, clean]));
    }, []);

    const deleteCategory = useCallback((name: string) => {
        setCategories((prev) => prev.filter((c) => c !== name));
    }, []);

    const addVenue = useCallback((name: string, capacity: number) => {
        const clean = name.trim();
        if (!clean) return;
        setVenues((prev) =>
            prev.some((v) => v.name === clean) ? prev : [...prev, { id: nextId("v"), name: clean, capacity }]
        );
    }, []);

    const updateVenue = useCallback((id: string, patch: Partial<Venue>) => {
        setVenues((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
    }, []);

    const deleteVenue = useCallback((id: string) => {
        setVenues((prev) => prev.filter((v) => v.id !== id));
    }, []);

    // ─── Notifications ─────────────────────────────────────────────

    const pushNotification = useCallback(
        (n: Omit<Notification, "id" | "timestamp" | "isRead">) => {
            setNotifications((prev) => [
                { ...n, id: nextId("ntf"), timestamp: "Just now", isRead: false },
                ...prev,
            ]);
        },
        []
    );

    const markNotificationRead = useCallback((id: string) => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    }, []);

    const markAllNotificationsRead = useCallback(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }, []);

    // ─── Physical classes ──────────────────────────────────────────

    const scheduleClass = useCallback<LmsContextValue["scheduleClass"]>(
        (input) => {
            // Learners need warning, and the entry pass has to be issued before
            // the door opens — so a class cannot be created inside the notice
            // window. The picker disables these dates too; this is the backstop.
            if (input.date < toDateKey(earliestSchedulableDate())) {
                throw new Error(
                    `A class must be scheduled at least 3 days ahead. The earliest available date is ${formatSessionDate(
                        toDateKey(earliestSchedulableDate())
                    )}.`
                );
            }

            const session: ClassSession = { ...input, id: nextId("cls") };
            setClassSessions((prev) => [...prev, session]);

            pushNotification({
                type: "new_class",
                title: "New class scheduled",
                message: `${session.title} on ${formatSessionDate(session.date)} at ${session.venue}.`,
            });

            return session;
        },
        [pushNotification]
    );

    const updateClassSession = useCallback((id: string, patch: Partial<ClassSession>) => {
        setClassSessions((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    }, []);

    const cancelClassSession = useCallback((id: string) => {
        setClassSessions((prev) => prev.filter((c) => c.id !== id));
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
            notifications,
            markNotificationRead,
            markAllNotificationsRead,
            instructors: adminUsers
                .filter((u) => u.role === "instructor" && u.status === "active")
                .map((u) => ({ id: u.id, name: u.name })),
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
        categories,
        venues,
        classSessions,
        notifications,
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
        submitAttempt,
    ]);

    return <LmsContext.Provider value={value}>{children}</LmsContext.Provider>;
}

export function useLms() {
    const ctx = useContext(LmsContext);
    if (!ctx) throw new Error("useLms must be used within an LmsProvider");
    return ctx;
}
