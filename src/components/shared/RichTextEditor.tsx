import { useEffect, useRef } from "react";
import DOMPurify from "dompurify";
import {
    TextBoldIcon,
    TextItalicIcon,
    LeftToRightListBulletIcon,
    LeftToRightListNumberIcon,
    Link01Icon,
    TextIcon,
} from "hugeicons-react";
import { cn } from "@/lib/utils";

/**
 * The tags a lesson note may contain. Anything else is stripped on the way in
 * and on the way out, so pasted markup from Word or a web page cannot smuggle
 * in a script or a style block.
 */
const ALLOWED = {
    ALLOWED_TAGS: ["p", "br", "b", "strong", "i", "em", "u", "ul", "ol", "li", "a", "h3", "h4", "blockquote", "code"],
    ALLOWED_ATTR: ["href", "target", "rel"],
};

export function sanitizeRichText(html: string): string {
    return DOMPurify.sanitize(html, ALLOWED);
}

interface ToolButton {
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    run: () => void;
}

interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    className?: string;
}

/**
 * Small rich-text field for lesson notes — bold, italic, lists, links.
 *
 * Deliberately built on contentEditable rather than pulling in an editor
 * framework: the format surface is five buttons, and the output is sanitised
 * HTML that the player renders directly.
 */
export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
    const ref = useRef<HTMLDivElement>(null);

    // Only write into the node when the incoming value genuinely differs, or
    // every keystroke would reset the caret to the start.
    useEffect(() => {
        const el = ref.current;
        if (el && el.innerHTML !== value) el.innerHTML = sanitizeRichText(value);
    }, [value]);

    const emit = () => {
        if (ref.current) onChange(sanitizeRichText(ref.current.innerHTML));
    };

    const exec = (command: string, arg?: string) => {
        ref.current?.focus();
        document.execCommand(command, false, arg);
        emit();
    };

    const addLink = () => {
        const url = window.prompt("Link URL", "https://");
        if (!url) return;
        exec("createLink", url);
        // Anything opening a new tab needs noopener, or the target page gets a
        // handle back to this one via window.opener.
        ref.current?.querySelectorAll("a").forEach((a) => {
            a.setAttribute("target", "_blank");
            a.setAttribute("rel", "noreferrer noopener");
        });
        emit();
    };

    const tools: ToolButton[] = [
        { label: "Bold", icon: TextBoldIcon, run: () => exec("bold") },
        { label: "Italic", icon: TextItalicIcon, run: () => exec("italic") },
        { label: "Bulleted list", icon: LeftToRightListBulletIcon, run: () => exec("insertUnorderedList") },
        { label: "Numbered list", icon: LeftToRightListNumberIcon, run: () => exec("insertOrderedList") },
        { label: "Heading", icon: TextIcon, run: () => exec("formatBlock", "<h3>") },
        { label: "Link", icon: Link01Icon, run: addLink },
    ];

    return (
        <div className={cn("rounded-xl border border-slate-200 bg-slate-50 overflow-hidden transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30", className)}>
            <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-slate-200 bg-white">
                {tools.map(({ label, icon: Icon, run }) => (
                    <button
                        key={label}
                        type="button"
                        title={label}
                        aria-label={label}
                        // Mousedown would blur the editable and lose the selection.
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={run}
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary hover:bg-slate-50 transition-colors"
                    >
                        <Icon size={15} />
                    </button>
                ))}
            </div>

            <div
                ref={ref}
                contentEditable
                role="textbox"
                aria-multiline="true"
                data-placeholder={placeholder}
                onInput={emit}
                onBlur={emit}
                onPaste={(e) => {
                    // Paste as text, then let the toolbar do the formatting —
                    // otherwise a paste from Word drags in a stylesheet.
                    e.preventDefault();
                    const text = e.clipboardData.getData("text/plain");
                    document.execCommand("insertText", false, text);
                }}
                className={cn(
                    "min-h-[140px] px-4 py-3 text-sm text-slate-700 bg-slate-50 outline-none",
                    "prose prose-sm max-w-none",
                    "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5",
                    "[&_a]:text-primary [&_a]:underline",
                    "[&_h3]:text-base [&_h3]:font-medium [&_h3]:text-slate-900 [&_h3]:mt-2",
                    "empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400"
                )}
            />
        </div>
    );
}

/** Read-only counterpart for the player. */
export function RichText({ html, className }: { html: string; className?: string }) {
    return (
        <div
            className={cn(
                "text-sm text-slate-600 leading-relaxed",
                "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5",
                "[&_a]:text-primary [&_a]:underline",
                "[&_h3]:text-base [&_h3]:font-medium [&_h3]:text-slate-900 [&_h3]:mt-3 [&_h3]:mb-1",
                "[&_p]:mb-2",
                className
            )}
            dangerouslySetInnerHTML={{ __html: sanitizeRichText(html) }}
        />
    );
}
