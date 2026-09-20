import { useRef, useState } from "react";
import { Upload01Icon, File01Icon, Cancel01Icon, Alert02Icon } from "hugeicons-react";
import { Button } from "@/components/ui/button";
import { supabase, describeError } from "@/lib/supabase";
import { cn } from "@/lib/utils";

/** Hard ceiling. Anything larger belongs on a CDN, not in a lesson. */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const ACCEPT_BY_TYPE: Record<string, string> = {
    video: "video/mp4,video/webm,video/quicktime",
    pdf: "application/pdf",
    document:
        "application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

function humanSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface FileDropzoneProps {
    /** Storage prefix — the course UUID the RLS policy keys off. */
    courseStorageId: string | null;
    kind: "video" | "pdf" | "document";
    /** Current public/signed URL, if the lesson already has one. */
    value?: string;
    onUploaded: (url: string, path: string) => void;
    onCleared: () => void;
}

/**
 * Drag-and-drop upload into the private `course-content` bucket.
 *
 * The bucket's policies key off the first path segment being a course the
 * caller owns, so `courseStorageId` must be the real `public.courses.id`.
 */
export function FileDropzone({
    courseStorageId,
    kind,
    value,
    onUploaded,
    onCleared,
}: FileDropzoneProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    const upload = async (file: File) => {
        setError(null);

        if (file.size > MAX_UPLOAD_BYTES) {
            setError(`That file is ${humanSize(file.size)}. The limit is 10 MB.`);
            return;
        }
        if (!courseStorageId) {
            setError(
                "This course has no Supabase record yet, so there is nowhere to upload to. Paste a URL instead."
            );
            return;
        }

        setBusy(true);
        try {
            // <course id>/<random>-<name> — the course prefix is what the
            // storage policy checks, the random part avoids collisions.
            const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
            const path = `${courseStorageId}/${crypto.randomUUID().slice(0, 8)}-${safeName}`;

            const { error: uploadError } = await supabase.storage
                .from("course-content")
                .upload(path, file, { contentType: file.type, upsert: false });
            if (uploadError) throw uploadError;

            // The bucket is private, so a signed URL is the only way to read it.
            // A year is long enough for a lesson; re-sign on read once content
            // is served through the player's own loader.
            const { data, error: signError } = await supabase.storage
                .from("course-content")
                .createSignedUrl(path, 60 * 60 * 24 * 365);
            if (signError) throw signError;

            setFileName(file.name);
            onUploaded(data.signedUrl, path);
        } catch (e) {
            setError(describeError(e as { message?: string }));
        } finally {
            setBusy(false);
        }
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) void upload(file);
    };

    if (value) {
        return (
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <File01Icon size={18} className="text-slate-400 shrink-0" />
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-700 truncate">
                        {fileName ?? "Attached file"}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{value}</p>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Remove file"
                    onClick={() => {
                        setFileName(null);
                        onCleared();
                    }}
                    className="h-8 w-8 rounded-full text-slate-400 hover:text-destructive shrink-0"
                >
                    <Cancel01Icon size={15} />
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
                }}
                className={cn(
                    "rounded-xl border-2 border-dashed px-4 py-7 text-center cursor-pointer transition-all",
                    dragging
                        ? "border-primary bg-accent/20"
                        : "border-slate-200 bg-slate-50 hover:border-slate-300",
                    busy && "opacity-60 pointer-events-none"
                )}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={ACCEPT_BY_TYPE[kind]}
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void upload(file);
                        e.target.value = "";
                    }}
                />

                {busy ? (
                    <div className="flex flex-col items-center gap-2">
                        <span className="h-5 w-5 border-2 border-slate-200 border-t-primary rounded-full animate-spin" />
                        <p className="text-xs font-medium text-slate-500">Uploading…</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-1.5">
                        <Upload01Icon size={22} className={cn(dragging ? "text-primary" : "text-slate-300")} />
                        <p className="text-xs font-medium text-slate-600">
                            Drop a file here, or <span className="text-primary">browse</span>
                        </p>
                        <p className="text-[11px] text-slate-400">
                            {kind === "video" ? "MP4, WebM or MOV" : "PDF, DOCX or PPTX"} · up to 10 MB
                        </p>
                    </div>
                )}
            </div>

            {error && (
                <p className="text-xs text-destructive font-medium flex items-start gap-1.5">
                    <Alert02Icon size={13} className="shrink-0 mt-0.5" />
                    {error}
                </p>
            )}
        </div>
    );
}
