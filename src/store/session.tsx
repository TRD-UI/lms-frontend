import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type Role = "student" | "instructor" | "admin";

export interface SessionUser {
    id: string;
    name: string;
    email: string;
    role: Role;
    avatarUrl: string;
    /** Fallback for the avatar. */
    initials: string;
    /** Shown under the name in layout headers. */
    roleLabel: string;
}

/**
 * Demo identities. Auth is simulated — signing in selects one of these rather
 * than validating credentials. Instructor ids match `Course.instructorId`, which
 * is what scopes the instructor portal to "my courses".
 */
export const DEMO_USERS: Record<Role, SessionUser> = {
    student: {
        id: "st-demo",
        name: "Cyber Smith",
        email: "cyber.smith@example.com",
        role: "student",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=CyberSmith",
        initials: "CS",
        roleLabel: "Student",
    },
    instructor: {
        id: "u-2",
        name: "Dr. Funke Akindele",
        email: "funke.a@trd.edu",
        role: "instructor",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=funke",
        initials: "FA",
        roleLabel: "Instructor",
    },
    admin: {
        id: "u-5",
        name: "Prof. Eze Nwosu",
        email: "eze.n@trd.edu",
        role: "admin",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=eze",
        initials: "EN",
        roleLabel: "Admin",
    },
};

interface SessionContextValue {
    user: SessionUser | null;
    isAuthenticated: boolean;
    signIn: (role: Role, overrides?: Partial<SessionUser>) => SessionUser;
    signOut: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<SessionUser | null>(null);

    const signIn = useCallback((role: Role, overrides?: Partial<SessionUser>) => {
        const next = { ...DEMO_USERS[role], ...overrides };
        setUser(next);
        return next;
    }, []);

    const signOut = useCallback(() => setUser(null), []);

    const value = useMemo(
        () => ({ user, isAuthenticated: user !== null, signIn, signOut }),
        [user, signIn, signOut]
    );

    return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
    const ctx = useContext(SessionContext);
    if (!ctx) throw new Error("useSession must be used within a SessionProvider");
    return ctx;
}

/**
 * The acting user for a given portal.
 *
 * Deep-linking straight to /admin or /instructor is supported (there is no real
 * auth to enforce), so when no one has signed in we fall back to that portal's
 * demo identity rather than rendering an empty shell.
 */
export function useActingUser(fallbackRole: Role): SessionUser {
    const { user } = useSession();
    if (user && user.role === fallbackRole) return user;
    return DEMO_USERS[fallbackRole];
}
