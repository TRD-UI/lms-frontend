import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Outlet, useLocation } from "react-router-dom";
import { Search01Icon } from "hugeicons-react";
import { NotificationDropdown } from "./NotificationDropdown";
import { UserDropdown } from "./UserDropdown";
import { cn } from "@/lib/utils";

export function DashboardLayout() {
    const { pathname } = useLocation();
    // The player hides the mobile nav, so it does not need the gutter that
    // keeps content clear of it — and that gutter made the page scrollable
    // past its own floating pager.
    const onPlayer = pathname.startsWith("/dashboard/player/");

    return (
        <SidebarProvider defaultOpen={true}>
            <div className="flex h-screen w-full bg-slate-100 overflow-hidden font-sans">
                <AppSidebar />
                <SidebarInset className="flex flex-col bg-white md:bg-slate-100 overflow-hidden">
                    <div className="flex-1 m-0 md:my-3 md:mr-3 rounded-none md:rounded-3xl bg-white md:border md:border-slate-200 overflow-hidden flex flex-col relative">
                        <header className="flex h-16 md:h-20 shrink-0 items-center justify-between px-4 md:px-10 border-b border-slate-100 z-10 bg-white">
                            <div className="flex items-center gap-3 w-1/2 md:w-1/3">
                                <div className="relative group w-full max-w-sm">
                                    <Search01Icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="h-10 md:h-11 w-full pl-11 pr-4 rounded-full md:rounded-xl bg-slate-50 md:bg-slate-100 border-none text-sm focus:ring-2 focus:ring-primary/10 transition-all outline-none placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 md:gap-4 w-1/2 md:w-1/3">
                                <NotificationDropdown />
                                <UserDropdown />
                            </div>
                        </header>

                        <main className={cn("flex-1 overflow-auto p-4 md:p-10", !onPlayer && "pb-24 md:pb-10")}>
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
