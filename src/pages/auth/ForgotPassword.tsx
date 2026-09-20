import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthFormField } from "@/components/auth/AuthFormField";
import { CheckmarkCircle02Icon } from "hugeicons-react";
import { useSession } from "@/store/session";


export default function ForgotPassword() {
    const { requestPasswordReset } = useSession();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await requestPasswordReset(email);
        } catch {
            // Deliberately swallowed. Reporting "no such account" here would let
            // anyone enumerate registered emails, so the confirmation screen is
            // shown either way.
        } finally {
            setLoading(false);
            setSent(true);
        }
    };

    if (sent) {
        return (
            <div className="w-full space-y-4 text-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-accent/50 flex items-center justify-center border border-accent/10">
                        <CheckmarkCircle02Icon size={32} className="text-primary" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-medium text-slate-900">Check your inbox</h1>
                        <p className="text-sm text-slate-500 font-normal">
                            We've sent a password reset link to <span className="font-medium text-slate-700">{email}</span>.
                        </p>
                    </div>
                </div>
                
                <Button
                    asChild
                    className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-white font-medium text-sm shadow-lg shadow-primary/10 transition-all"
                >
                    <Link to="/login">Back to Sign In</Link>
                </Button>
                <p className="text-xs text-slate-400 font-normal">
                    Didn't receive it?{" "}
                    <button
                        onClick={() => setSent(false)}
                        className="font-medium text-primary hover:underline"
                    >
                        Try again
                    </button>
                </p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-8">
            <div className="space-y-1">
                <h1 className="text-2xl font-medium text-slate-900">Forgot password?</h1>
                <p className="text-sm text-slate-500 font-normal">
                    Enter your email address and we'll send you a reset link.
                </p>
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

                <Button
                    type="submit"
                    disabled={loading || !email}
                    className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-white font-medium text-sm shadow-lg shadow-primary/10 transition-all"
                >
                    {loading ? (
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        "Send Reset Link"
                    )}
                </Button>
            </form>

            <Link
                to="/login"
                className="block text-center text-sm font-medium text-slate-500 hover:text-primary transition-colors"
            >
                Back to Sign In
            </Link>
        </div>
    );
}
