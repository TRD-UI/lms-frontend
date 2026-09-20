import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Notification01Icon, 
    BookOpen01Icon, 
    Calendar02Icon, 
    CreditCardIcon, 
    Alert02Icon,
    CheckmarkBadge01Icon
} from "hugeicons-react";
import { 
    Popover, 
    PopoverContent, 
    PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { NotificationType } from "@/data/notifications";
import { useLms } from "@/store/lms-store";
import { cn } from "@/lib/utils";

const iconMap: Record<NotificationType, React.ElementType> = {
    course_update: BookOpen01Icon,
    new_class: Calendar02Icon,
    transaction: CreditCardIcon,
    system: Alert02Icon,
};

const bgMap: Record<NotificationType, string> = {
    course_update: "bg-blue-50 text-blue-600",
    new_class: "bg-emerald-50 text-emerald-600",
    transaction: "bg-amber-50 text-amber-600",
    system: "bg-slate-100 text-slate-600",
};

export function NotificationDropdown() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const { notifications, markNotificationRead, markAllNotificationsRead } = useLms();

    const open_ = (n: (typeof notifications)[number]) => {
        void markNotificationRead(n.id);
        if (n.link) {
            setOpen(false);
            navigate(n.link);
        }
    };

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full relative hover:bg-slate-50 transition-colors h-11 w-11" aria-label="Notifications">
                    <Notification01Icon size={22} className="text-slate-600" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2.5 right-2.5 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive border-[2px] border-white"></span>
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent 
                align="end" 
                className="w-80 p-0 rounded-2xl shadow-xl border-slate-100 overflow-hidden"
                sideOffset={8}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-medium text-slate-900 text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-2 rounded-full text-[10px]">
                            {unreadCount} new
                        </Badge>
                    )}
                </div>

                {/* Body (thin scrollbar) */}
                <div className="max-h-[360px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    {notifications.length > 0 ? (
                        <div className="flex flex-col">
                            {notifications.map((notification) => {
                                const Icon = iconMap[notification.type];
                                return (
                                    <div
                                        key={notification.id}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => open_(notification)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") open_(notification);
                                        }}
                                        className={cn(
                                            "flex items-start gap-3 p-4 border-b border-slate-50 transition-colors hover:bg-slate-50 cursor-pointer",
                                            !notification.isRead ? "bg-primary/[0.02]" : ""
                                        )}
                                    >
                                        <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5", bgMap[notification.type])}>
                                            <Icon size={16} />
                                        </div>
                                        <div className="flex flex-col gap-1 pr-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className={cn("text-xs font-medium leading-tight", !notification.isRead ? "text-slate-900" : "text-slate-700")}>
                                                    {notification.title}
                                                </h4>
                                                {!notification.isRead && (
                                                    <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1" />
                                                )}
                                            </div>
                                            <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <span className="text-[10px] text-slate-400 font-medium mt-1">
                                                {notification.timestamp}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                            <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-3">
                                <CheckmarkBadge01Icon size={24} />
                            </div>
                            <p className="text-sm font-medium text-slate-900">All caught up!</p>
                            <p className="text-xs text-slate-500 mt-1">You have no new notifications.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-2 border-t border-slate-100 bg-slate-50/50">
                    <Button
                        variant="ghost"
                        onClick={() => void markAllNotificationsRead()}
                        disabled={unreadCount === 0}
                        className="w-full text-xs font-medium text-primary hover:bg-primary/5 hover:text-primary rounded-xl h-8 disabled:opacity-40"
                    >
                        Mark all as read
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
