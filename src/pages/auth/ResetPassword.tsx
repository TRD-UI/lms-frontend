import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthFormField } from "@/components/auth/AuthFormField";
import { CheckmarkCircle02Icon, Alert02Icon } from "hugeicons-react";
import { useSession } from "@/store/session";
import { supabase, describeError } from "@/lib/supabase";
import { toast } from "sonner";

/**
 * Lands here from the emailed reset link.
 *
 * Supabase exchanges the recovery token in the URL for a short-lived session
 * before this renders (detectSessionInUrl), so the page's job is to confirm a
 * recovery session exists and then call updateUser.
 */
export default function ResetPassword() {
    const navigate = useNavigate();
    const { updatePassword, signOut } = useSession();
    const [ready, setReady] = useState<"checking" | "valid" | "invalid">("checking");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    useEffect(() => {
        let active = true;
        supabase.auth.getSession().then(({ data }) => {
            if (!active) return;
            setReady(data.session ? "valid" : "invalid");
        });
        return () => { active = false; };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }
        if (password !== confirm) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await updatePassword(password);
            // Sign the recovery session out so the new password is actually used
            // to get back in.
            await signOut();
            setDone(true);
            toast.success("Password updated");
        } catch (err) {
            setError(describeError(err as { message?: string }));
        } finally {
            setLoading(false);
        }
    };

    if (ready === "checking") {
        return (
            <div className="w-full flex justify-center py-12">
                <div className="h-6 w-6 border-2 border-slate-200 border-t-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (ready === "invalid") {
        return (
            <div className="w-full space-y-6 text-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-destructive/5 flex items-center justify-center border border-destructive/10">
                        <Alert02Icon size={32} className="text-destructive" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-medium text-slate-900">Link expired</h1>
                        <p className="text-sm text-slate-500 font-normal">
                            This reset link is no longer valid. Request a new one and it will arrive within a minute.
                        </p>
                    </div>
                </div>
                <Button
                    asChild
                    className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-white font-medium text-sm shadow-lg shadow-primary/10 transition-all"
                >
                    <Link to="/forgot-password">Request a new link</Link>
                </Button>
            </div>
        );
    }

    if (done) {
        return (
            <div className="w-full space-y-6 text-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-accent/50 flex items-center justify-center border border-accent/10">
                        <CheckmarkCircle02Icon size={32} className="text-primary" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-medium text-slate-900">Password updated</h1>
                        <p className="text-sm text-slate-500 font-normal">
                            Sign in with your new password to continue.
                        </p>
                    </div>
                </div>
                <Button
                    onClick={() => navigate("/login", { replace: true })}
                    className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-white font-medium text-sm shadow-lg shadow-primary/10"
                >
                    Go to Sign In
                </Button>
            </div>
        );
    }

    return (
        <div className="w-full space-y-8">
            <div className="space-y-1">
                <h1 className="text-2xl font-medium text-slate-900">Set a new password</h1>
                <p className="text-sm text-slate-500 font-normal">
                    Choose a password you have not used on this account before.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <AuthFormField
                    label="New Password"
                    id="password"
                    type="password"
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                />
                <AuthFormField
                    label="Confirm Password"
                    id="confirm-password"
                    type="password"
                    placeholder="Re-enter password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    disabled={loading}
                />

                {error && (
                    <p role="alert" className="text-xs font-medium text-destructive bg-destructive/5 rounded-xl px-4 py-3">
                        {error}
                    </p>
                )}

                <Button
                    type="submit"
                    disabled={loading || !password || !confirm}
                    className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-white font-medium text-sm shadow-lg shadow-primary/10 transition-all"
                >
                    {loading ? (
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        "Update Password"
                    )}
                </Button>
            </form>
        </div>
    );
}
