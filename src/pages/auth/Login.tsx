import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthFormField } from "@/components/auth/AuthFormField";
import { useSession } from "@/store/session";
import { describeError } from "@/lib/supabase";
import { toast } from "sonner";


export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { signIn, signOut } = useSession();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Set by RequireRole when an unauthenticated visitor is bounced off a
    // protected route, so they land back where they were headed.
    const from = (location.state as { from?: string } | null)?.from;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const user = await signIn(email, password);

            // The two sign-in surfaces stay separate: staff belong on
            // /staff-login, which routes them to the right portal.
            if (user.role !== "student") {
                await signOut();
                setError("This is a staff account. Use the staff sign-in page.");
                return;
            }

            toast.success(`Welcome back, ${user.name.split(" ")[0]}`);
            navigate(from ?? "/dashboard", { replace: true });
        } catch (err) {
            setError(describeError(err as { message?: string }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full space-y-8">
            <div className="space-y-1">
                <h1 className="text-2xl font-medium text-slate-900">Welcome back</h1>
                <p className="text-sm text-slate-500 font-normal">Sign in to access your learning dashboard.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <AuthFormField
                    label="Email Address"
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    disabled={loading}
                />
                <AuthFormField
                    label="Password"
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    disabled={loading}
                />

                {error && (
                    <p role="alert" className="text-xs font-medium text-destructive bg-destructive/5 rounded-xl px-4 py-3">
                        {error}
                    </p>
                )}

                <div className="flex justify-end">
                    <Link
                        to="/forgot-password"
                        className="text-xs font-medium text-primary hover:underline"
                    >
                        Forgot password?
                    </Link>
                </div>

                <Button
                    type="submit"
                    disabled={loading || !email || !password}
                    className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-white font-medium text-sm transition-all shadow-lg shadow-primary/10"
                >
                    {loading ? (
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        "Sign In"
                    )}
                </Button>
            </form>

            <p className="text-center text-sm text-slate-500 font-normal">
                Don't have an account?{" "}
                <Link to="/signup" className="font-medium text-primary hover:underline">
                    Create account
                </Link>
            </p>
        </div>
    );
}
