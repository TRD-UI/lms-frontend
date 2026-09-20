import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/types/database";

export type Role = "student" | "instructor" | "admin";

export interface SessionUser {
    id: string;
    name: string;
    email: string;
    role: Role;
    status: "active" | "suspended" | "pending";
    avatarUrl: string;
    /** Fallback for the avatar. */
    initials: string;
    /** Shown under the name in layout headers. */
    roleLabel: string;
    phone: string | null;
}

const ROLE_LABEL: Record<Role, string> = {
    student: "Student",
    instructor: "Instructor",
    admin: "Admin",
};

function initialsOf(name: string): string {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("") || "?";
}

function toSessionUser(profile: Tables<"profiles">): SessionUser {
    return {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        status: profile.status,
        avatarUrl: profile.avatar_url ?? "",
        initials: initialsOf(profile.name),
        roleLabel: ROLE_LABEL[profile.role],
        phone: profile.phone,
    };
}

export type SessionStatus = "loading" | "authenticated" | "anonymous";

interface SessionContextValue {
    user: SessionUser | null;
    status: SessionStatus;
    isAuthenticated: boolean;
    signIn: (email: string, password: string) => Promise<SessionUser>;
    signUp: (input: { name: string; email: string; password: string; phone?: string }) =>
        Promise<{ needsEmailConfirmation: boolean }>;
    signOut: () => Promise<void>;
    requestPasswordReset: (email: string) => Promise<void>;
    updatePassword: (password: string) => Promise<void>;
    updateProfile: (patch: { name?: string; phone?: string | null; avatarUrl?: string | null }) => Promise<void>;
    refresh: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<SessionUser | null>(null);
    const [status, setStatus] = useState<SessionStatus>("loading");
    // Guards against a slow profile fetch resolving after a newer auth event.
    const generation = useRef(0);

    const loadProfile = useCallback(async (session: Session | null) => {
        const ticket = ++generation.current;

        if (!session?.user) {
            if (ticket === generation.current) {
                setUser(null);
                setStatus("anonymous");
            }
            return;
        }

        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

        if (ticket !== generation.current) return;

        if (error || !data) {
            // The auth user exists but has no profile — the provisioning trigger
            // did not run. Treat it as signed out rather than half-authenticated.
            setUser(null);
            setStatus("anonymous");
            return;
        }

        // A suspended account keeps its token until expiry, so the check has to
        // happen here as well as in the RLS policies.
        if (data.status === "suspended") {
            await supabase.auth.signOut();
            setUser(null);
            setStatus("anonymous");
            return;
        }

        setUser(toSessionUser(data));
        setStatus("authenticated");
    }, []);

    useEffect(() => {
        let active = true;

        supabase.auth.getSession().then(({ data }) => {
            if (active) void loadProfile(data.session);
        });

        const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
            // PASSWORD_RECOVERY fires on the reset-password page with a
            // short-lived session. Loading the profile there is harmless and
            // lets the page greet the user by name.
            if (event === "SIGNED_OUT") {
                generation.current++;
                setUser(null);
                setStatus("anonymous");
                return;
            }
            void loadProfile(session);
        });

        return () => {
            active = false;
            subscription.subscription.unsubscribe();
        };
    }, [loadProfile]);

    const signIn = useCallback<SessionContextValue["signIn"]>(async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();
        if (profileError || !profile) throw profileError ?? new Error("Profile not found");

        if (profile.status === "suspended") {
            await supabase.auth.signOut();
            throw new Error("This account has been suspended. Contact an administrator.");
        }

        const next = toSessionUser(profile);
        setUser(next);
        setStatus("authenticated");
        return next;
    }, []);

    const signUp = useCallback<SessionContextValue["signUp"]>(async ({ name, email, password, phone }) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name, phone: phone ?? "" },
                emailRedirectTo: `${window.location.origin}/login`,
            },
        });
        if (error) throw error;
        // Role is assigned server-side and always starts as 'student'; staff are
        // promoted by an admin, so there is nothing to set here.
        //
        // With "Confirm email" enabled (the Supabase default) signUp returns no
        // session — the caller shows a check-your-inbox screen instead of
        // navigating into the app.
        return { needsEmailConfirmation: data.session === null };
    }, []);

    const signOut = useCallback(async () => {
        await supabase.auth.signOut();
        setUser(null);
        setStatus("anonymous");
    }, []);

    const requestPasswordReset = useCallback(async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
    }, []);

    const updatePassword = useCallback(async (password: string) => {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
    }, []);

    const updateProfile = useCallback<SessionContextValue["updateProfile"]>(async (patch) => {
        const { data: authData } = await supabase.auth.getUser();
        const id = authData.user?.id;
        if (!id) throw new Error("Not signed in");

        const { data, error } = await supabase
            .from("profiles")
            .update({
                ...(patch.name !== undefined ? { name: patch.name } : {}),
                ...(patch.phone !== undefined ? { phone: patch.phone } : {}),
                ...(patch.avatarUrl !== undefined ? { avatar_url: patch.avatarUrl } : {}),
            })
            .eq("id", id)
            .select()
            .single();
        if (error) throw error;
        setUser(toSessionUser(data));
    }, []);

    const refresh = useCallback(async () => {
        const { data } = await supabase.auth.getSession();
        await loadProfile(data.session);
    }, [loadProfile]);

    const value = useMemo<SessionContextValue>(
        () => ({
            user,
            status,
            isAuthenticated: status === "authenticated",
            signIn,
            signUp,
            signOut,
            requestPasswordReset,
            updatePassword,
            updateProfile,
            refresh,
        }),
        [user, status, signIn, signUp, signOut, requestPasswordReset, updatePassword, updateProfile, refresh]
    );

    return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
    const ctx = useContext(SessionContext);
    if (!ctx) throw new Error("useSession must be used within a SessionProvider");
    return ctx;
}

/**
 * The acting user for a portal.
 *
 * Every portal is behind <RequireRole>, so by the time a page renders there is
 * a signed-in user of the right role. `expectedRole` is kept as an argument
 * because the call sites read well with it, and it surfaces a mismatch in
 * development rather than failing silently.
 */
export function useActingUser(expectedRole: Role): SessionUser {
    const { user } = useSession();
    if (!user) {
        throw new Error(
            `useActingUser("${expectedRole}") rendered without a session — this page must sit behind <RequireRole>.`
        );
    }
    if (import.meta.env.DEV && user.role !== expectedRole) {
        console.warn(`Expected a ${expectedRole} here, but the signed-in user is a ${user.role}.`);
    }
    return user;
}
