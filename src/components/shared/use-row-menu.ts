import { useState } from "react";

/**
 * Lets a whole table row raise its own actions menu.
 *
 * A row of read-only cells with a three-dot menu tucked at the far right is a
 * small target and an easy thing to miss, so a click anywhere neutral on the
 * row opens the same menu. Clicks that land on a real control — a link, a
 * button, a checkbox — are left alone, because those already mean something.
 */
export function useRowMenu() {
    const [openId, setOpenId] = useState<string | null>(null);

    const rowClick = (id: string) => (event: React.MouseEvent) => {
        if ((event.target as HTMLElement).closest("a,button,input,select,textarea,[role='menuitem']")) {
            return;
        }
        setOpenId(id);
    };

    const menu = (id: string) => ({
        open: openId === id,
        onOpenChange: (next: boolean) => setOpenId(next ? id : null),
    });

    return { rowClick, menu };
}
