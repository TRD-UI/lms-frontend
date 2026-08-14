import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { Outlet } from "react-router-dom";
import { Search01Icon } from "hugeicons-react";
import { NotificationDropdown } from "./NotificationDropdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useActingUser } from "@/store/session";

export function AdminLayout() {
    const admin = useActingUser("admin");

    return (
        <SidebarProvider defaultOpen={true}>
            <div className="flex h-screen w-full bg-slate-100 overflow-hidden font-sans">
                <AdminSidebar />
                <SidebarInset className="flex flex-col bg-slate-100 overflow-hidden">
                    <div className="flex-1 my-3 mr-3 rounded-3xl bg-white border border-slate-200 overflow-hidden flex flex-col">
                        <header className="flex h-20 shrink-0 items-center justify-between px-10 border-b border-slate-100">
                            <div className="flex items-center gap-3 w-1/3">
                                <div className="relative group w-full max-w-sm">
                                    <Search01Icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Search courses, users..."
                                        aria-label="Search admin dashboard"
                                        className="h-11 w-full pl-11 pr-4 rounded-xl bg-slate-100 border-none text-sm focus:ring-2 focus:ring-primary/10 transition-all outline-none placeholder:text-slate-400"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-4 w-1/3">
                                <NotificationDropdown />
                                <div className="flex items-center gap-3 pl-2 border-l border-slate-100">
                                    <div className="flex flex-col items-end mr-1">
                                        <span className="text-sm font-medium text-slate-800">{admin.name}</span>
                                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">
                                            {admin.roleLabel}
                                        </span>
                                    </div>
                                    <Avatar className="h-11 w-11 border rounded-full border-slate-100 bg-accent shadow-sm">
                                        <AvatarImage src={admin.avatarUrl} />
                                        <AvatarFallback className="bg-primary/5 text-primary text-xs font-medium">
                                            {admin.initials}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                            </div>
                        </header>
                        <main className="flex-1 overflow-auto p-10">
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
