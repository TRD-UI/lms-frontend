import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthFormField } from "@/components/auth/AuthFormField";
import { useSession } from "@/store/session";


export default function Login() {
    const navigate = useNavigate();
    const { signIn } = useSession();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate auth call
        setTimeout(() => {
            setLoading(false);
            // Auth is simulated: signing in selects the student demo identity.
            signIn("student", { email });
            navigate("/dashboard");
        }, 1200);
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
