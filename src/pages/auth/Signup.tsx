import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthFormField } from "@/components/auth/AuthFormField";
import { useSession } from "@/store/session";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";


const ROLES = [
    "Instructor",
    "Student",
];

export default function Signup() {
    const navigate = useNavigate();
    const { signIn } = useSession();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        organization: "",
        role: "",
        password: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState<Partial<typeof form>>({});

    const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(f => ({ ...f, [key]: e.target.value }));

    const canSubmit = !loading &&
        form.name.trim() !== "" &&
        form.email.trim() !== "" &&
        form.phone.trim() !== "" &&
        form.password !== "" &&
        form.confirmPassword !== "";

    const validate = () => {
        const e: Partial<typeof form> = {};
        if (!form.name) e.name = "Full name is required.";
        if (!form.email) e.email = "Email is required.";
        if (!form.phone) e.phone = "Phone number is required.";
        if (!form.password) e.password = "Password is required.";
        if (form.password && form.password.length < 8) e.password = "Password must be at least 8 characters.";
        if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match.";
        return e;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            // The role picked at signup decides which portal the user lands in.
            const role = form.role === "Instructor" ? "instructor" : "student";
            signIn(role, { name: form.name, email: form.email });
            navigate(role === "instructor" ? "/instructor" : "/dashboard");
        }, 1300);
    };

    return (
        <div className="w-full space-y-8">
            <div className="space-y-1">
                <h1 className="text-2xl font-medium text-slate-900">Create account</h1>
                <p className="text-sm text-slate-500 font-normal">Join the TRD Learning Platform to get started.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <AuthFormField
                    label="Full Name" id="name" placeholder="John Doe"
                    value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    error={errors.name} required disabled={loading}
                />
                <div className="grid grid-cols-2 gap-3">
                    <AuthFormField
                        label="Email Address" id="email" type="email" placeholder="you@example.com"
                        value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        error={errors.email} required disabled={loading}
                    />
                    <AuthFormField
                        label="Phone Number" id="phone" type="tel" placeholder="+234 800 000 0000"
                        value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        error={errors.phone} required disabled={loading}
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <AuthFormField
                        label="Organization" id="organization" placeholder="University of Ibadan"
                        value={form.organization} onChange={e => setForm(f => ({ ...f, organization: e.target.value }))}
                        disabled={loading}
                    />
                    {/* Role - shadcn Select */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-slate-600">Role</label>
                        <Select
                            value={form.role}
                            onValueChange={val => setForm(f => ({ ...f, role: val }))}
                            disabled={loading}
                        >
                            <SelectTrigger className="h-12 rounded-xl bg-white border-transparent text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30">
                                <SelectValue placeholder="Select role..." />
                            </SelectTrigger>
                            <SelectContent>
                                {ROLES.map(r => (
                                    <SelectItem key={r} value={r}>{r}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <AuthFormField
                    label="Password" id="password" type="password" placeholder="Min. 8 characters"
                    value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    error={errors.password} required disabled={loading}
                />
                <AuthFormField
                    label="Confirm Password" id="confirmPassword" type="password" placeholder="Re-enter password"
                    value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                    error={errors.confirmPassword} required disabled={loading}
                />

                <Button
                    type="submit"
                    disabled={!canSubmit}
                    className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-white font-medium text-sm shadow-lg shadow-primary/10 transition-all mt-2"
                >
                    {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Create Account"}
                </Button>
            </form>

            <p className="text-center text-sm text-slate-500 font-normal">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
            </p>
        </div>
    );
}
