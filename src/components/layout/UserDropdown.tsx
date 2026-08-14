import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Logout01Icon, Settings01Icon, UserIcon } from "hugeicons-react";
import { useNavigate } from "react-router-dom";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useActingUser, useSession } from "@/store/session";

export function UserDropdown() {
    const navigate = useNavigate();
    const student = useActingUser("student");
    const { signOut } = useSession();
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [logoutOpen, setLogoutOpen] = useState(false);

    const handleLogout = () => {
        setLogoutOpen(false);
        signOut();
        navigate("/login");
    };

    return (
        <>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                    <button className="flex items-center gap-3 pl-2 sm:border-l sm:border-slate-100 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-full sm:rounded-none">
                        <div className="hidden sm:flex flex-col items-end mr-1">
                            <span className="text-sm font-medium text-slate-800">{student.name}</span>
                            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">
                                {student.roleLabel}
                            </span>
                        </div>
                        <Avatar className="h-10 w-10 sm:h-11 sm:w-11 border rounded-full border-slate-100 bg-accent shadow-sm">
                            <AvatarImage src={student.avatarUrl} />
                            <AvatarFallback className="bg-primary/5 text-primary text-xs font-medium">{student.initials}</AvatarFallback>
                        </Avatar>
                    </button>
                </PopoverTrigger>
                <PopoverContent
                    align="end"
                    className="w-64 p-2 rounded-2xl shadow-xl border-slate-100"
                    sideOffset={8}
                >
                    <div className="px-4 py-3 border-b border-slate-100 mb-2 flex flex-col gap-1">
                        <p className="text-sm font-medium text-slate-900 leading-none">{student.name}</p>
                        <p className="text-xs text-slate-500 font-medium">{student.roleLabel}</p>
                        <p className="text-[10px] text-slate-400 font-normal leading-tight mt-1">{student.email}</p>
                    </div>

                    <div className="flex flex-col gap-1">
                        <button className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 font-medium rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors w-full text-left">
                            <Settings01Icon size={16} />
                            Account Settings
                        </button>

                        <div className="h-px bg-slate-100 my-1 w-full" />

                        <button
                            onClick={() => {
                                setPopoverOpen(false);
                                setLogoutOpen(true);
                            }}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-destructive font-medium rounded-xl hover:bg-red-50 transition-colors w-full text-left"
                        >
                            <Logout01Icon size={16} />
                            Sign Out
                        </button>
                    </div>
                </PopoverContent>
            </Popover>

            <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
                <AlertDialogContent className="rounded-2xl border-slate-100 shadow-xl max-w-sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg font-medium text-slate-900">
                            Sign out?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-500 font-normal text-sm">
                            You'll need to sign in again to access your learning dashboard.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-2">
                        <AlertDialogCancel className="rounded-full h-10 border-slate-200 text-slate-500 font-normal">
                            Stay signed in
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleLogout}
                            className="rounded-full h-10 bg-destructive hover:bg-destructive/90 text-white font-normal"
                        >
                            Sign out
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
