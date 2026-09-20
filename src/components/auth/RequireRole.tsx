import { Navigate, useLocation } from "react-router-dom";
import { useSession, type Role } from "@/store/session";

const HOME_FOR: Record<Role, string> = {
    student: "/dashboard",
    instructor: "/instructor",
    admin: "/admin",
};

function FullPageSpinner() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="h-8 w-8 border-2 border-slate-200 border-t-primary rounded-full animate-spin" />
        </div>
    );
}

/**
 * Gate for a portal.
 *
 * Replaces the previous behaviour where deep-linking to /admin or /instructor
 * silently rendered a demo identity. RLS is the real boundary — this just keeps
 * the wrong person from seeing a shell they cannot populate.
 */
export function RequireRole({
    allow,
    children,
}: {
    allow: Role | Role[];
    children: React.ReactNode;
}) {
    const { user, status } = useSession();
    const location = useLocation();
    const allowed = Array.isArray(allow) ? allow : [allow];

    if (status === "loading") return <FullPageSpinner />;

    if (status === "anonymous" || !user) {
        // Staff land on the staff form; everyone else on the learner one.
        const target = allowed.includes("student") ? "/login" : "/staff-login";
        return <Navigate to={target} replace state={{ from: location.pathname + location.search }} />;
    }

    if (!allowed.includes(user.role)) {
        // Signed in, wrong portal: send them to their own rather than a 403.
        return <Navigate to={HOME_FOR[user.role]} replace />;
    }

    return <>{children}</>;
}

/** Keeps a signed-in user off the auth screens. */
export function RedirectIfAuthenticated({ children }: { children: React.ReactNode }) {
    const { user, status } = useSession();

    if (status === "loading") return <FullPageSpinner />;
    if (user) return <Navigate to={HOME_FOR[user.role]} replace />;

    return <>{children}</>;
}
