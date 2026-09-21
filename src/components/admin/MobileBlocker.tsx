import { ComputerIcon } from "hugeicons-react";

/**
 * Stands in for the admin console on a phone.
 *
 * Returned in place of the layout rather than hidden with CSS, so the admin
 * tree and its queries never mount on a screen that cannot show them.
 */
export function MobileBlocker() {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center text-center px-8 bg-white">
            <ComputerIcon size={40} className="text-primary" />
            <h1 className="mt-5 text-xl font-medium tracking-tight text-slate-900">
                Desktop only
            </h1>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-[17rem]">
                The admin console needs a wider screen. Open it on a laptop or desktop.
            </p>
        </div>
    );
}
