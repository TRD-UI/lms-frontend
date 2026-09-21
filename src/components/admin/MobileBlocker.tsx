import { ComputerIcon, Logout01Icon } from "hugeicons-react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/store/session";
import { Button } from "@/components/ui/button";

/**
 * Stands in for the admin console on a phone.
 *
 * Returned in place of the layout rather than hidden with CSS, so the admin
 * tree and its queries never mount on a screen that cannot show them. That
 * also removes the header, which is why signing out lives here — otherwise an
 * admin who opens this on their phone has no way off the page.
 */
export function MobileBlocker() {
    const navigate = useNavigate();
    const { signOut } = useSession();

    const handleSignOut = async () => {
        await signOut();
        navigate("/login", { replace: true });
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center text-center px-8 bg-white">
            <ComputerIcon size={40} className="text-primary" />
            <h1 className="mt-5 text-xl font-medium tracking-tight text-slate-900">
                Desktop only
            </h1>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-[17rem]">
                The admin console needs a wider screen. Open it on a laptop or desktop.
            </p>
            <Button
                onClick={() => void handleSignOut()}
                className="mt-8 h-11 px-5 rounded-full bg-primary hover:bg-primary/90 text-white font-medium text-sm shadow-lg shadow-primary/10"
            >
                Sign out
                <Logout01Icon size={16} className="ml-1.5" />
            </Button>
        </div>
    );
}
