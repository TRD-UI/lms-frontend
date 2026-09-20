import { useRef, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera01Icon, ViewIcon, ViewOffIcon } from "hugeicons-react";
import { useSession } from "@/store/session";
import { supabase, describeError } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Tab = "profile" | "password";

const FIELD =
    "w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 " +
    "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 " +
    "focus:border-primary/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed";

function Field({
    label, id, hint, ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; id: string; hint?: string }) {
    return (
        <div className="space-y-1.5">
            <label htmlFor={id} className="text-xs font-medium text-slate-600">{label}</label>
            <input id={id} className={FIELD} {...props} />
            {hint && <p className="text-xs text-slate-400 font-normal">{hint}</p>}
        </div>
    );
}

/** Password field with a reveal toggle, matching the auth screens. */
function PasswordField({
    label, id, value, onChange, disabled, autoComplete,
}: {
    label: string;
    id: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    autoComplete?: string;
}) {
    const [show, setShow] = useState(false);
    return (
        <div className="space-y-1.5">
            <label htmlFor={id} className="text-xs font-medium text-slate-600">{label}</label>
            <div className="relative">
                <input
                    id={id}
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    autoComplete={autoComplete}
                    className={cn(FIELD, "pr-12")}
                />
                <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    aria-label={show ? "Hide password" : "Show password"}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                    {show ? <ViewOffIcon size={18} /> : <ViewIcon size={18} />}
                </button>
            </div>
        </div>
    );
}

/**
 * Shared by all three portals — mounted at /dashboard/settings,
 * /instructor/settings and /admin/settings so it renders inside the right shell.
 *
 * Role and status are read-only: profiles_guard_privileges() rejects a
 * self-service change to either.
 */
export default function AccountSettings() {
    const { user, updateProfile, updatePassword } = useSession();
    const fileInput = useRef<HTMLInputElement>(null);
    const [tab, setTab] = useState<Tab>("profile");

    const [name, setName] = useState(user?.name ?? "");
    const [phone, setPhone] = useState(user?.phone ?? "");
    const [savingProfile, setSavingProfile] = useState(false);

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [savingPassword, setSavingPassword] = useState(false);

    const [uploading, setUploading] = useState(false);

    if (!user) return null;

    const profileDirty = name !== user.name || (phone ?? "") !== (user.phone ?? "");

    const saveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            await updateProfile({ name: name.trim(), phone: phone.trim() || null });
            toast.success("Profile updated");
        } catch (err) {
            toast.error("Could not save", { description: describeError(err as { message?: string }) });
        } finally {
            setSavingProfile(false);
        }
    };

    const changePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 8) return toast.error("Password must be at least 8 characters.");
        if (password !== confirm) return toast.error("Passwords do not match.");

        setSavingPassword(true);
        try {
            await updatePassword(password);
            setPassword("");
            setConfirm("");
            toast.success("Password changed");
        } catch (err) {
            toast.error("Could not change password", { description: describeError(err as { message?: string }) });
        } finally {
            setSavingPassword(false);
        }
    };

    const uploadAvatar = async (file: File) => {
        setUploading(true);
        try {
            // The avatars bucket policy only permits writes under <user id>/.
            const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
            const path = `${user.id}/avatar.${ext}`;

            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(path, file, { upsert: true, contentType: file.type });
            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from("avatars").getPublicUrl(path);
            // Cache-bust so the new image shows immediately at a stable path.
            await updateProfile({ avatarUrl: `${data.publicUrl}?v=${Date.now()}` });
            toast.success("Photo updated");
        } catch (err) {
            toast.error("Upload failed", { description: describeError(err as { message?: string }) });
        } finally {
            setUploading(false);
        }
    };

    const TABS: { key: Tab; label: string }[] = [
        { key: "profile", label: "Profile" },
        { key: "password", label: "Password" },
    ];

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <PageHeader title="Account settings" description="Your details, photo and password." />

            <div className="px-1 sm:px-2">
                <div className="flex items-center gap-6 sm:gap-8 border-b border-slate-100">
                    {TABS.map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setTab(key)}
                            className={cn(
                                "pb-3 sm:pb-4 text-xs sm:text-sm font-medium transition-all relative",
                                tab === key ? "text-primary" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {label}
                            {tab === key && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-1 sm:px-2 max-w-xl">
                {tab === "profile" ? (
                    <form onSubmit={saveProfile} className="space-y-6">
                        <div className="relative w-fit">
                            <Avatar className="h-24 w-24 border border-slate-100">
                                <AvatarImage src={user.avatarUrl} alt="" />
                                <AvatarFallback className="bg-primary/10 text-primary font-medium text-xl">
                                    {user.initials}
                                </AvatarFallback>
                            </Avatar>
                            <input
                                ref={fileInput}
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) void uploadAvatar(file);
                                    e.target.value = "";
                                }}
                            />
                            <button
                                type="button"
                                disabled={uploading}
                                onClick={() => fileInput.current?.click()}
                                aria-label="Change profile photo"
                                className={cn(
                                    "absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-white",
                                    "flex items-center justify-center shadow-lg shadow-primary/20",
                                    "ring-4 ring-white hover:bg-primary/90 transition-all",
                                    "disabled:opacity-60 disabled:cursor-not-allowed"
                                )}
                            >
                                {uploading ? (
                                    <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Camera01Icon size={15} />
                                )}
                            </button>
                        </div>

                        <Field
                            label="Full name" id="name" value={name}
                            onChange={(e) => setName(e.target.value)}
                            required disabled={savingProfile}
                        />
                        <Field
                            label="Phone number" id="phone" type="tel" value={phone ?? ""}
                            placeholder="+234 800 000 0000"
                            onChange={(e) => setPhone(e.target.value)}
                            disabled={savingProfile}
                        />
                        <Field label="Email address" id="email" value={user.email} readOnly disabled />
                        <Field label="Role" id="role" value={user.roleLabel} readOnly disabled />

                        <Button
                            type="submit"
                            disabled={savingProfile || !profileDirty || !name.trim()}
                            className="rounded-full h-11 px-6 bg-primary hover:bg-primary/90 text-white font-medium text-sm"
                        >
                            {savingProfile ? "Saving…" : "Save changes"}
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={changePassword} className="space-y-6">
                        <PasswordField
                            label="New password" id="new-password" value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password" disabled={savingPassword}
                        />
                        <PasswordField
                            label="Confirm new password" id="confirm-password" value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            autoComplete="new-password" disabled={savingPassword}
                        />
                        <Button
                            type="submit"
                            disabled={savingPassword || !password || !confirm}
                            className="rounded-full h-11 px-6 bg-primary hover:bg-primary/90 text-white font-medium text-sm"
                        >
                            {savingPassword ? "Updating…" : "Change password"}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}
