import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { Outlet } from "react-router-dom";
import { NotificationDropdown } from "./NotificationDropdown";
import { UserDropdown } from "./UserDropdown";
import { GlobalSearch } from "@/components/shared/GlobalSearch";
import { MobileBlocker } from "@/components/admin/MobileBlocker";
import { useIsMobile } from "@/hooks/use-mobile";

export function AdminLayout() {
    const isMobile = useIsMobile();

    // Dense tables, wide charts and multi-column forms: there is no useful
    // phone rendering of this, so it is blocked rather than half-adapted.
    if (isMobile) return <MobileBlocker />;

    return (
        <SidebarProvider defaultOpen={true}>
            <div className="flex h-screen w-full bg-slate-100 overflow-hidden font-sans">
                <AdminSidebar />
                <SidebarInset className="flex flex-col bg-slate-100 overflow-hidden">
                    <div className="flex-1 my-3 mr-3 rounded-3xl bg-white border border-slate-200 overflow-hidden flex flex-col">
                        <header className="flex h-20 shrink-0 items-center justify-between px-10 border-b border-slate-100">
                            <div className="flex items-center gap-3 w-1/3">
                                <div className="w-full max-w-sm">
                                    <GlobalSearch placeholder="Search courses, users, classes..." />
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-4 w-1/3">
                                <NotificationDropdown />
                                <UserDropdown />
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
