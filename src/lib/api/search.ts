import { supabase } from "@/lib/supabase";
import type { Role } from "@/store/session";

/**
 * Global search.
 *
 * Every query below is an ordinary table read, so RLS decides the scope: a
 * learner searching "python" matches the courses they can see, an instructor
 * matches theirs, an admin matches everything. Nothing here checks a role in
 * order to hide rows — the role only picks which tables are worth asking and
 * where a hit should navigate to.
 */

export type SearchGroup =
    | "Pages"
    | "Courses"
    | "Lessons"
    | "Assessments"
    | "Classes"
    | "Certificates"
    | "Entry passes"
    | "People"
    | "Venues";

export interface SearchResult {
    id: string;
    group: SearchGroup;
    title: string;
    subtitle?: string;
    /** Where selecting the result takes you. */
    to: string;
}

/**
 * PostgREST parses `or=(...)` itself, so a comma, parenthesis or wildcard in
 * the term would change the meaning of the filter rather than be searched for.
 */
function pattern(term: string): string {
    return `%${term.replace(/[,()*%\\]/g, " ").trim()}%`;
}

const PAGES: { label: string; hint: string; to: string; roles: Role[] }[] = [
    { label: "Overview", hint: "Your progress at a glance", to: "/dashboard", roles: ["student"] },
    { label: "Courses", hint: "Catalogue and your learning", to: "/dashboard/learning", roles: ["student"] },
    { label: "Assessments", hint: "Tests, checkpoints and exams", to: "/dashboard/assessments", roles: ["student"] },
    { label: "Entry passes", hint: "Your class passes", to: "/dashboard/passes", roles: ["student"] },
    { label: "Certificates", hint: "Credentials you have earned", to: "/dashboard/certificates", roles: ["student"] },
    { label: "Account settings", hint: "Details, photo and password", to: "/dashboard/settings", roles: ["student"] },

    { label: "Analytics", hint: "Revenue, learners and course health", to: "/admin", roles: ["admin"] },
    { label: "Course manager", hint: "Courses, applications, waitlist", to: "/admin/courses", roles: ["admin"] },
    { label: "Applications", hint: "Admission requests awaiting review", to: "/admin/courses", roles: ["admin"] },
    { label: "Waitlist", hint: "Learners waiting for a seat", to: "/admin/courses", roles: ["admin"] },
    { label: "Assessments", hint: "Coverage per course", to: "/admin/assessments", roles: ["admin"] },
    { label: "User management", hint: "Accounts, roles and access", to: "/admin/users", roles: ["admin"] },
    { label: "System health", hint: "Sync log and audit trail", to: "/admin/system", roles: ["admin"] },
    { label: "Institution settings", hint: "Contacts and enrolment rules", to: "/admin/courses", roles: ["admin"] },
    { label: "Account settings", hint: "Details, photo and password", to: "/admin/settings", roles: ["admin"] },

    { label: "Home", hint: "Your teaching at a glance", to: "/instructor", roles: ["instructor"] },
    { label: "My courses", hint: "Courses you run", to: "/instructor/courses", roles: ["instructor"] },
    { label: "Scanner", hint: "Check learners in at the door", to: "/instructor/scanner", roles: ["instructor"] },
    { label: "Attendance", hint: "Cohort registers and grading", to: "/instructor/attendance", roles: ["instructor"] },
    { label: "Account settings", hint: "Details, photo and password", to: "/instructor/settings", roles: ["instructor"] },
];

const courseRoute = (role: Role, courseId: string) =>
    role === "student" ? `/dashboard/learning/${courseId}`
        : role === "instructor" ? `/instructor/courses/${courseId}`
            : `/admin/assessments/${courseId}`;

export async function globalSearch(term: string, role: Role): Promise<SearchResult[]> {
    const trimmed = term.trim();
    if (trimmed.length < 2) return [];
    const like = pattern(trimmed);
    if (like === "%%") return [];

    const lower = trimmed.toLowerCase();
    const pages: SearchResult[] = PAGES
        .filter((p) => p.roles.includes(role))
        .filter((p) => p.label.toLowerCase().includes(lower) || p.hint.toLowerCase().includes(lower))
        .slice(0, 4)
        .map((p) => ({ id: `page:${p.to}:${p.label}`, group: "Pages", title: p.label, subtitle: p.hint, to: p.to }));

    const staff = role === "admin" || role === "instructor";

    const [courses, lessons, assessments, sessions, certificates, passes, people, venues] =
        await Promise.all([
            supabase.from("courses")
                .select("id, title, category, status")
                .or(`title.ilike.${like},category.ilike.${like},description.ilike.${like}`)
                .limit(5),

            supabase.from("module_items")
                .select("id, title, type, module:course_modules!inner ( id, course_id, course:courses!inner ( title ) )")
                .ilike("title", like)
                .limit(5),

            supabase.from("assessments")
                .select("id, title, course_id, course:courses ( title )")
                .ilike("title", like)
                .limit(5),

            supabase.from("course_sessions")
                .select("id, title, session_date, venue_name")
                .or(`title.ilike.${like},venue_name.ilike.${like}`)
                .limit(5),

            role === "student"
                ? supabase.from("certificates")
                    .select("id, credential_id, course:courses ( title )")
                    .ilike("credential_id", like)
                    .limit(4)
                : Promise.resolve({ data: [], error: null }),

            supabase.from("entry_passes")
                .select("id, pass_code, session:course_sessions ( title )")
                .ilike("pass_code", like)
                .limit(4),

            staff
                ? supabase.from("profiles")
                    .select("id, name, email, role")
                    .or(`name.ilike.${like},email.ilike.${like}`)
                    .limit(5)
                : Promise.resolve({ data: [], error: null }),

            role === "admin"
                ? supabase.from("venues").select("id, name, capacity").ilike("name", like).limit(4)
                : Promise.resolve({ data: [], error: null }),
        ]);

    const out: SearchResult[] = [...pages];

    for (const c of courses.data ?? []) {
        out.push({
            id: `course:${c.id}`,
            group: "Courses",
            title: c.title,
            subtitle: c.status === "draft" ? `${c.category} · draft` : c.category,
            to: courseRoute(role, c.id),
        });
    }

    type LessonRow = {
        id: string; title: string; type: string;
        module: { id: string; course_id: string; course: { title: string } | null } | null;
    };
    for (const l of (lessons.data ?? []) as unknown as LessonRow[]) {
        if (!l.module) continue;
        out.push({
            id: `lesson:${l.id}`,
            group: "Lessons",
            title: l.title,
            subtitle: l.module.course?.title,
            // Learners open the lesson itself; staff land on the course that owns it.
            to: role === "student"
                ? `/dashboard/player/${l.module.course_id}/${l.module.id}/${l.id}`
                : courseRoute(role, l.module.course_id),
        });
    }

    type AssessmentRow = { id: string; title: string; course_id: string; course: { title: string } | null };
    for (const a of (assessments.data ?? []) as unknown as AssessmentRow[]) {
        out.push({
            id: `assessment:${a.id}`,
            group: "Assessments",
            title: a.title,
            subtitle: a.course?.title,
            to: role === "student" ? "/dashboard/assessments"
                : role === "instructor" ? `/instructor/courses/${a.course_id}/${a.id}`
                    : `/admin/assessments/${a.course_id}/${a.id}`,
        });
    }

    for (const s of sessions.data ?? []) {
        out.push({
            id: `session:${s.id}`,
            group: "Classes",
            title: s.title,
            subtitle: `${s.session_date} · ${s.venue_name}`,
            to: role === "student" ? "/dashboard/passes"
                : role === "instructor" ? "/instructor/attendance"
                    : "/admin/courses",
        });
    }

    type CertRow = { id: string; credential_id: string; course: { title: string } | null };
    for (const c of (certificates.data ?? []) as unknown as CertRow[]) {
        out.push({
            id: `certificate:${c.id}`,
            group: "Certificates",
            title: c.credential_id,
            subtitle: c.course?.title,
            to: "/dashboard/certificates",
        });
    }

    type PassRow = { id: string; pass_code: string; session: { title: string } | null };
    for (const p of (passes.data ?? []) as unknown as PassRow[]) {
        out.push({
            id: `pass:${p.id}`,
            group: "Entry passes",
            title: p.pass_code,
            subtitle: p.session?.title,
            to: role === "student" ? "/dashboard/passes" : "/instructor/scanner",
        });
    }

    for (const p of people.data ?? []) {
        out.push({
            id: `person:${p.id}`,
            group: "People",
            title: p.name,
            subtitle: `${p.email} · ${p.role}`,
            to: role === "admin" ? "/admin/users" : "/instructor/courses",
        });
    }

    for (const v of venues.data ?? []) {
        out.push({
            id: `venue:${v.id}`,
            group: "Venues",
            title: v.name,
            subtitle: `Capacity ${v.capacity}`,
            to: "/admin/courses",
        });
    }

    return out;
}
