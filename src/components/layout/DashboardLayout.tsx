import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Outlet, useLocation } from "react-router-dom";
import { NotificationDropdown } from "./NotificationDropdown";
import { UserDropdown } from "./UserDropdown";
import { GlobalSearch } from "@/components/shared/GlobalSearch";
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
                                <div className="w-full max-w-sm">
                                    <GlobalSearch />
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
