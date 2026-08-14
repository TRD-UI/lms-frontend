import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthFormField } from "@/components/auth/AuthFormField";
import { ArrowRight01Icon } from "hugeicons-react";
import { toast } from "sonner";
import { useSession } from "@/store/session";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type StaffRole = "admin" | "instructor";

export default function StaffLogin() {
    const navigate = useNavigate();
    const { signIn } = useSession();
    const [selectedRole, setSelectedRole] = useState<StaffRole>("admin");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) return;

        setLoading(true);
        // Simulate auth call
        setTimeout(() => {
            setLoading(false);
            signIn(selectedRole, { email });
            toast.success(`Signed in as ${selectedRole === "admin" ? "Administrator" : "Instructor"}`, {
                description: "Redirecting to your dashboard...",
            });
            navigate(selectedRole === "admin" ? "/admin" : "/instructor");
        }, 1200);
    };

    return (
        <div className="w-full space-y-8">
            {/* Header */}
            <div className="space-y-1">
                <h1 className="text-2xl font-medium text-slate-900">Staff Sign In</h1>
                <p className="text-sm text-slate-500 font-normal">
                    Access the administration or instructor portal.
                </p>
            </div>

            {/* Role Selector */}
            <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">
                    Sign in as <span className="text-destructive ml-1">*</span>
                </label>
                <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as StaffRole)}>
                    <SelectTrigger className="w-full h-12 px-4 rounded-xl bg-slate-100 border border-transparent text-sm text-slate-900 focus:outline-none bg-white transition-all">
                        <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                        <SelectItem value="admin" className="text-sm cursor-pointer rounded-lg hover:bg-slate-50">Administrator</SelectItem>
                        <SelectItem value="instructor" className="text-sm cursor-pointer rounded-lg hover:bg-slate-50">Instructor</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <AuthFormField
                    label="Staff Email"
                    id="staff-email"
                    type="email"
                    placeholder="your.name@trd.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                />
                <AuthFormField
                    label="Password"
                    id="staff-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                    className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-white font-medium text-sm transition-all shadow-lg shadow-primary/10 gap-2"
                >
                    {loading ? (
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            Sign In as {selectedRole === "admin" ? "Admin" : "Instructor"}
                            <ArrowRight01Icon size={16} />
                        </>
                    )}
                </Button>
            </form>
        </div>
    );
}
