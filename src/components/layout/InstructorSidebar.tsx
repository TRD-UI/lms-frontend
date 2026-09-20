import {
    Calendar03Icon,
    QrCode01Icon,
    UserGroupIcon,
    Logout01Icon,
    Analytics01Icon,
    BookOpen01Icon,
} from "hugeicons-react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useNavigate, useLocation } from "react-router-dom";
import { useSession } from "@/store/session";
import { useState } from "react";

const items = [
    { title: "Home", url: "/instructor", icon: Analytics01Icon },
    { title: "Courses", url: "/instructor/courses", icon: BookOpen01Icon },
    { title: "Classes", url: "/instructor/classes", icon: Calendar03Icon },
    { title: "Scanner", url: "/instructor/scanner", icon: QrCode01Icon },
    { title: "Attendance", url: "/instructor/attendance", icon: UserGroupIcon },
];

export function InstructorSidebar() {
    const navigate = useNavigate();
    const { signOut } = useSession();
    const location = useLocation();
    const [logoutOpen, setLogoutOpen] = useState(false);

    const isActive = (url: string) => {
        if (url === "/instructor") return location.pathname === "/instructor";
        return location.pathname.startsWith(url);
    };

    const handleLogout = async () => {
        setLogoutOpen(false);
        await signOut();
        navigate("/staff-login", { replace: true });
    };

    return (
        <Sidebar collapsible="none" className="w-20 bg-slate-100 p-0 overflow-visible">
            <SidebarHeader className="flex items-center justify-center pt-10 pb-6">
                <img src="/logo.png" alt="TRD Instructor" className="h-10 w-10 object-contain" />
            </SidebarHeader>
            <SidebarContent className="px-2 overflow-visible">
                <SidebarMenu className="gap-2">
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                isActive={isActive(item.url)}
                                onClick={() => navigate(item.url)}
                                className="flex flex-col items-center justify-center gap-2 h-auto py-3 px-0 transition-all duration-300 bg-transparent hover:bg-transparent data-[active=true]:bg-transparent group"
                            >
                                <div className="flex flex-col items-center gap-1">
                                    <div className="h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:bg-slate-200 group-data-[active=true]:bg-primary">
                                        <item.icon
                                            size={24}
                                            className="transition-transform duration-300 group-data-[active=true]:text-white text-slate-500"
                                        />
                                    </div>
                                    <span className="text-[10px] font-normal leading-none group-data-[active=true]:text-primary text-slate-500">
                                        {item.title}
                                    </span>
                                </div>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="pb-10 flex items-center justify-center">
                <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
                    <AlertDialogTrigger asChild>
                        <button
                            className="flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-destructive transition-all duration-300"
                            aria-label="Sign out"
                        >
                            <Logout01Icon size={24} />
                            <span className="text-[10px] font-normal leading-none">Logout</span>
                        </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-2xl border-slate-100 shadow-xl max-w-sm">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-lg font-medium text-slate-900">
                                Sign out?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-500 font-normal text-sm">
                                Unsaved attendance data will be synced before signing out.
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
            </SidebarFooter>
        </Sidebar>
    );
}
