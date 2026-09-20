import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthFormField } from "@/components/auth/AuthFormField";
import { useSession } from "@/store/session";
import { describeError } from "@/lib/supabase";
import { toast } from "sonner";


const HOME_FOR = {
    student: "/dashboard",
    instructor: "/instructor",
    admin: "/admin",
} as const;

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { signIn } = useSession();
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

            // One form for everyone. The account's role decides the portal —
            // splitting this in two only duplicated the form and the redirect,
            // and hiding /admin behind a second URL was never a security
            // boundary; RLS is.
            toast.success(`Welcome back, ${user.name.split(" ")[0]}`);
            navigate(from ?? HOME_FOR[user.role], { replace: true });
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
                <p className="text-sm text-slate-500 font-normal">Sign in to your account.</p>
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
