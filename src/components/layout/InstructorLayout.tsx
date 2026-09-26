import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { InstructorSidebar } from "./InstructorSidebar";
import { Outlet } from "react-router-dom";
import { Wifi01Icon, WifiDisconnected01Icon } from "hugeicons-react";
import { NotificationDropdown } from "./NotificationDropdown";
import { UserDropdown } from "./UserDropdown";
import { Badge } from "@/components/ui/badge";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { GlobalSearch } from "@/components/shared/GlobalSearch";
import { cn } from "@/lib/utils";

export function InstructorLayout() {
    const online = useOnlineStatus();

    return (
        <SidebarProvider defaultOpen={true}>
            <div className="flex h-screen w-full bg-slate-100 overflow-hidden font-sans">
                <InstructorSidebar />
                <SidebarInset className="flex flex-col bg-white md:bg-slate-100 overflow-hidden">
                    <div className="flex-1 m-0 md:my-3 md:mr-3 rounded-none md:rounded-3xl bg-white md:border md:border-slate-200 overflow-hidden flex flex-col">
                        <header className="flex h-16 md:h-20 shrink-0 items-center justify-between px-4 md:px-10 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <img src="/logo.png" alt="TRD" className="h-8 w-8 object-contain md:hidden" />
                                {/* Reports the browser's own connectivity. An
                                    instructor marking a register needs to know
                                    when their check-ins have stopped landing. */}
                                <Badge
                                    variant="secondary"
                                    aria-live="polite"
                                    className={cn(
                                        "text-[10px] font-medium px-2.5 py-1 rounded-full gap-1.5",
                                        online
                                            ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                            : "bg-red-50 text-red-600 border-red-200"
                                    )}
                                >
                                    {online ? <Wifi01Icon size={12} /> : <WifiDisconnected01Icon size={12} />}
                                    {online ? "Online" : "Offline"}
                                </Badge>
                            </div>
                            <div className="hidden sm:block flex-1 max-w-xs mx-4">
                                <GlobalSearch placeholder="Search your courses..." />
                            </div>
                            <div className="flex items-center justify-end gap-2 md:gap-4">
                                <NotificationDropdown />
                                <UserDropdown />
                            </div>
                        </header>
                        {/* pb-24 keeps the last row clear of the floating mobile nav. */}
                        <main className="flex-1 overflow-auto p-4 pb-24 md:p-10">
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
