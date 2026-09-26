import type { Role } from "@/store/session";
import type { Course } from "@/data/types";
import type { Assessment } from "@/data/assessment-types";
import type { ClassSession } from "@/data/classes";
import type { EntryPass } from "@/data/entry-passes";
import type { Venue } from "@/lib/api/reference";

/**
 * Dashboard search — entirely client-side.
 *
 * Everything it looks through is already in the LMS store, loaded for the
 * screens the person is using. No request is made while they type, which is
 * what makes it feel instant; the trade-off is that it only finds what the
 * dashboard has, which is the whole point of it.
 */

export type SearchGroup =
    | "Pages"
    | "Courses"
    | "Lessons"
    | "Assessments"
    | "Classes"
    | "Entry passes"
    | "People"
    | "Venues"
    | "Categories";

export interface SearchResult {
    id: string;
    group: SearchGroup;
    title: string;
    subtitle?: string;
    to: string;
}

export interface SearchCorpus {
    courses: Course[];
    assessments: Assessment[];
    classSessions: ClassSession[];
    entryPasses: EntryPass[];
    venues: Venue[];
    categories: string[];
    instructors: { id: string; name: string }[];
}

/** The order groups appear in. */
export const GROUP_ORDER: SearchGroup[] = [
    "Pages", "Courses", "Lessons", "Assessments", "Classes",
    "Entry passes", "People", "Venues", "Categories",
];

const PAGES: { label: string; hint: string; to: string; roles: Role[] }[] = [
    { label: "Overview", hint: "Your progress at a glance", to: "/dashboard", roles: ["student"] },
    { label: "Courses", hint: "Catalogue and your learning", to: "/dashboard/learning", roles: ["student"] },
    { label: "Assessments", hint: "Tests, checkpoints and exams", to: "/dashboard/assessments", roles: ["student"] },
    { label: "Entry passes", hint: "Your class passes", to: "/dashboard/passes", roles: ["student"] },
    { label: "Certificates", hint: "Credentials you have earned", to: "/dashboard/certificates", roles: ["student"] },
    { label: "Account settings", hint: "Profile, photo and password", to: "/dashboard/settings", roles: ["student"] },

    { label: "Analytics", hint: "Revenue, learners and course health", to: "/admin", roles: ["admin"] },
    { label: "Course manager", hint: "Courses, capacity and fees", to: "/admin/courses", roles: ["admin"] },
    { label: "Applications", hint: "Admission requests awaiting review", to: "/admin/courses", roles: ["admin"] },
    { label: "Waitlist", hint: "Learners waiting for a seat", to: "/admin/courses", roles: ["admin"] },
    { label: "Assessments", hint: "Coverage per course", to: "/admin/assessments", roles: ["admin"] },
    { label: "User management", hint: "Accounts, roles and access", to: "/admin/users", roles: ["admin"] },
    { label: "System health", hint: "Sync log and audit trail", to: "/admin/system", roles: ["admin"] },
    { label: "Account settings", hint: "Profile, photo and password", to: "/admin/settings", roles: ["admin"] },

    { label: "Home", hint: "Your teaching at a glance", to: "/instructor", roles: ["instructor"] },
    { label: "My courses", hint: "Courses you run", to: "/instructor/courses", roles: ["instructor"] },
    { label: "Applications", hint: "Applicants for your courses", to: "/instructor/courses", roles: ["instructor"] },
    { label: "Scanner", hint: "Check learners in at the door", to: "/instructor/scanner", roles: ["instructor"] },
    { label: "Attendance", hint: "Cohort registers and grading", to: "/instructor/attendance", roles: ["instructor"] },
    { label: "Account settings", hint: "Profile, photo and password", to: "/instructor/settings", roles: ["instructor"] },
];

const courseRoute = (role: Role, courseId: string) =>
    role === "student" ? `/dashboard/learning/${courseId}`
        : role === "instructor" ? `/instructor/courses/${courseId}`
            : `/admin/assessments/${courseId}`;

/** A prefix match is almost always the one that was meant, so it sorts first. */
function rank(haystack: string, needle: string): number | null {
    const index = haystack.toLowerCase().indexOf(needle);
    if (index < 0) return null;
    return index === 0 ? 0 : 1;
}

const PER_GROUP = 5;

export function searchDashboard(term: string, role: Role, corpus: SearchCorpus): SearchResult[] {
    const needle = term.trim().toLowerCase();
    if (needle.length < 2) return [];

    const found: { result: SearchResult; score: number }[] = [];
    const add = (score: number | null, result: SearchResult) => {
        if (score !== null) found.push({ result, score });
    };
    /** Best (lowest) rank across several fields. */
    const best = (...fields: (string | undefined)[]) =>
        fields.reduce<number | null>((acc, field) => {
            const r = field ? rank(field, needle) : null;
            return r === null ? acc : acc === null ? r : Math.min(acc, r);
        }, null);

    for (const page of PAGES) {
        if (!page.roles.includes(role)) continue;
        add(best(page.label, page.hint), {
            id: `page:${page.to}:${page.label}`,
            group: "Pages",
            title: page.label,
            subtitle: page.hint,
            to: page.to,
        });
    }

    for (const course of corpus.courses) {
        add(best(course.title, course.category, course.description, course.instructorName), {
            id: `course:${course.id}`,
            group: "Courses",
            title: course.title,
            subtitle: course.status === "draft" ? `${course.category} · draft` : course.category,
            to: courseRoute(role, course.id),
        });

        for (const module of course.modules) {
            for (const item of module.items) {
                add(best(item.title, module.title), {
                    id: `lesson:${item.id}`,
                    group: "Lessons",
                    title: item.title,
                    subtitle: `${course.title} · ${module.title}`,
                    // A learner opens the lesson itself; staff land on the course.
                    to: role === "student"
                        ? `/dashboard/player/${course.id}/${module.id}/${item.id}`
                        : courseRoute(role, course.id),
                });
            }
        }
    }

    const courseTitle = (id: string) => corpus.courses.find((c) => c.id === id)?.title;

    for (const assessment of corpus.assessments) {
        add(best(assessment.title, courseTitle(assessment.courseId)), {
            id: `assessment:${assessment.id}`,
            group: "Assessments",
            title: assessment.title,
            subtitle: courseTitle(assessment.courseId),
            to: role === "student" ? "/dashboard/assessments"
                : role === "instructor" ? `/instructor/courses/${assessment.courseId}/${assessment.id}`
                    : `/admin/assessments/${assessment.courseId}/${assessment.id}`,
        });
    }

    for (const session of corpus.classSessions) {
        add(best(session.title, session.venue, session.roomNumber), {
            id: `class:${session.id}`,
            group: "Classes",
            title: session.title,
            subtitle: `${session.date} · ${session.venue}`,
            to: role === "student" ? "/dashboard/passes"
                : role === "instructor" ? "/instructor/attendance"
                    : "/admin/courses",
        });
    }

    for (const pass of corpus.entryPasses) {
        add(best(pass.passCode, pass.eventTitle, pass.venue), {
            id: `pass:${pass.id}`,
            group: "Entry passes",
            title: pass.passCode,
            subtitle: pass.eventTitle,
            to: role === "student" ? "/dashboard/passes" : "/instructor/scanner",
        });
    }

    if (role !== "student") {
        for (const person of corpus.instructors) {
            add(best(person.name), {
                id: `person:${person.id}`,
                group: "People",
                title: person.name,
                subtitle: "Instructor",
                to: role === "admin" ? "/admin/users" : "/instructor/courses",
            });
        }
    }

    if (role === "admin") {
        for (const venue of corpus.venues) {
            add(best(venue.name), {
                id: `venue:${venue.id}`,
                group: "Venues",
                title: venue.name,
                subtitle: `Capacity ${venue.capacity}`,
                to: "/admin/courses",
            });
        }
        for (const category of corpus.categories) {
            add(best(category), {
                id: `category:${category}`,
                group: "Categories",
                title: category,
                to: "/admin/courses",
            });
        }
    }

    /*
     * Rank: a prefix match beats a match in the middle of a word; then the
     * kind of thing it is, in the same order the panel lists groups; then the
     * shorter title. Without the group term, typing "python" put a class
     * called "Python Lab" above the course "Python Programming" purely
     * because the title was shorter, and the returned order disagreed with
     * the order the panel actually renders.
     */
    found.sort((a, b) =>
        a.score - b.score
        || GROUP_ORDER.indexOf(a.result.group) - GROUP_ORDER.indexOf(b.result.group)
        || a.result.title.length - b.result.title.length
    );

    const perGroup = new Map<SearchGroup, number>();
    return found
        .filter(({ result }) => {
            const used = perGroup.get(result.group) ?? 0;
            if (used >= PER_GROUP) return false;
            perGroup.set(result.group, used + 1);
            return true;
        })
        .map(({ result }) => result);
}
