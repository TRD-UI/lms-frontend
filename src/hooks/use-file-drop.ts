import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Drop-target wiring for a file.
 *
 * Three things have to be right or a drop silently does nothing:
 *
 *  1. `dragenter` *and* `dragover` must both call preventDefault. Preventing
 *     only `dragover` is the usual mistake — without `dragenter` the element is
 *     never registered as a drop target and `drop` never fires.
 *  2. `dragleave` fires when the pointer crosses onto a *child* element, so a
 *     naive handler clears the highlight while the pointer is still inside.
 *     A depth counter avoids the flicker.
 *  3. The window default is to navigate to the dropped file. Miss the target by
 *     a few pixels and the browser replaces the page with the image — which
 *     reads as "drag and drop is broken".
 */
export function useFileDrop(onFile: (file: File) => void) {
    const [dragging, setDragging] = useState(false);
    const depth = useRef(0);

    // Without this, a near-miss drop navigates away from the app.
    useEffect(() => {
        const swallow = (e: DragEvent) => {
            e.preventDefault();
        };
        window.addEventListener("dragover", swallow);
        window.addEventListener("drop", swallow);
        return () => {
            window.removeEventListener("dragover", swallow);
            window.removeEventListener("drop", swallow);
        };
    }, []);

    const onDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        depth.current += 1;
        setDragging(true);
    }, []);

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Tells the OS this is a copy, which fixes the cursor on some platforms.
        if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        depth.current = Math.max(0, depth.current - 1);
        if (depth.current === 0) setDragging(false);
    }, []);

    const onDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            depth.current = 0;
            setDragging(false);

            const file =
                e.dataTransfer?.files?.[0] ??
                // Safari populates `items` rather than `files` in some versions.
                Array.from(e.dataTransfer?.items ?? [])
                    .find((i) => i.kind === "file")
                    ?.getAsFile() ??
                null;

            if (file) onFile(file);
        },
        [onFile]
    );

    return { dragging, dropProps: { onDragEnter, onDragOver, onDragLeave, onDrop } };
}
