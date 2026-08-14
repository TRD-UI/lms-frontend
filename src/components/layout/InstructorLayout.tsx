import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { InstructorSidebar } from "./InstructorSidebar";
import { Outlet } from "react-router-dom";
import { Wifi01Icon } from "hugeicons-react";
import { NotificationDropdown } from "./NotificationDropdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useActingUser } from "@/store/session";

export function InstructorLayout() {
    const instructor = useActingUser("instructor");

    return (
        <SidebarProvider defaultOpen={true}>
            <div className="flex h-screen w-full bg-slate-100 overflow-hidden font-sans">
                <InstructorSidebar />
                <SidebarInset className="flex flex-col bg-slate-100 overflow-hidden">
                    <div className="flex-1 my-3 mr-3 rounded-3xl bg-white border border-slate-200 overflow-hidden flex flex-col">
                        <header className="flex h-20 shrink-0 items-center justify-between px-6 sm:px-10 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-emerald-200 text-[10px] font-medium px-2.5 py-1 rounded-full gap-1.5">
                                    <Wifi01Icon size={12} />
                                    Online
                                </Badge>
                            </div>
                            <div className="flex items-center justify-end gap-4">
                                <NotificationDropdown />
                                <div className="flex items-center gap-3 pl-2 border-l border-slate-100">
                                    <div className="flex flex-col items-end mr-1">
                                        <span className="text-sm font-medium text-slate-800">{instructor.name}</span>
                                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">
                                            {instructor.roleLabel}
                                        </span>
                                    </div>
                                    <Avatar className="h-11 w-11 border rounded-full border-slate-100 bg-accent shadow-sm">
                                        <AvatarImage src={instructor.avatarUrl} />
                                        <AvatarFallback className="bg-primary/5 text-primary text-xs font-medium">{instructor.initials}</AvatarFallback>
                                    </Avatar>
                                </div>
                            </div>
                        </header>
                        <main className="flex-1 overflow-auto p-10">
                            {/* Same content cap as the admin portal so pages line up across roles. */}
                            <div className="mx-auto max-w-7xl">
                                <Outlet />
                            </div>
                        </main>
                    </div>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
