import { useRef, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera01Icon } from "hugeicons-react";
import { useSession } from "@/store/session";
import { supabase, describeError } from "@/lib/supabase";
import { toast } from "sonner";

const FIELD =
    "w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 " +
    "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/10 " +
    "focus:border-primary/30 transition-all disabled:opacity-60";

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

function Card({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
    return (
        <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 p-5 sm:p-8 space-y-5">
            <div className="space-y-1">
                <h2 className="text-base sm:text-lg font-medium text-slate-900">{title}</h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">{description}</p>
            </div>
            {children}
        </section>
    );
}

/**
 * Shared by all three portals — mounted at /dashboard/settings,
 * /instructor/settings and /admin/settings so it renders inside the right shell.
 *
 * Role and status are intentionally read-only here: profiles_guard_privileges()
 * rejects a self-service change to either.
 */
export default function AccountSettings() {
    const { user, updateProfile, updatePassword } = useSession();
    const fileInput = useRef<HTMLInputElement>(null);

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
        if (password.length < 8) {
            toast.error("Password must be at least 8 characters.");
            return;
        }
        if (password !== confirm) {
            toast.error("Passwords do not match.");
            return;
        }
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

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PageHeader
                title="Account settings"
                description="Your details, photo and password."
            />

            <div className="grid gap-6 px-1 sm:px-2 max-w-3xl">
                <Card title="Profile photo" description="A square image works best. Up to 2 MB.">
                    <div className="flex items-center gap-5">
                        <Avatar className="h-20 w-20 border border-slate-100">
                            <AvatarImage src={user.avatarUrl} alt="" />
                            <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                                {user.initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
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
                            <Button
                                type="button"
                                variant="outline"
                                disabled={uploading}
                                onClick={() => fileInput.current?.click()}
                                className="rounded-full h-10 gap-2 border-slate-200"
                            >
                                <Camera01Icon size={16} />
                                {uploading ? "Uploading…" : "Change photo"}
                            </Button>
                        </div>
                    </div>
                </Card>

                <Card title="Your details" description="How your name appears across the platform.">
                    <form onSubmit={saveProfile} className="space-y-4">
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
                        <Field
                            label="Email address" id="email" value={user.email} readOnly disabled
                            hint="Contact an administrator to change the email on your account."
                        />
                        <Field
                            label="Role" id="role" value={user.roleLabel} readOnly disabled
                            hint="Roles are assigned by an administrator."
                        />

                        <Button
                            type="submit"
                            disabled={savingProfile || !profileDirty || !name.trim()}
                            className="rounded-full h-11 px-6 bg-primary hover:bg-primary/90 text-white font-medium text-sm"
                        >
                            {savingProfile ? "Saving…" : "Save changes"}
                        </Button>
                    </form>
                </Card>

                <Card title="Password" description="Use at least 8 characters.">
                    <form onSubmit={changePassword} className="space-y-4">
                        <Field
                            label="New password" id="new-password" type="password"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password" disabled={savingPassword}
                        />
                        <Field
                            label="Confirm new password" id="confirm-password" type="password"
                            value={confirm} onChange={(e) => setConfirm(e.target.value)}
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
                </Card>
            </div>
        </div>
    );
}
