import { useState } from "react";
import { adminUsers } from "@/data/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Search01Icon,
    UserMultiple02Icon,
    Edit01Icon,
    Mail01Icon,
    MoreHorizontalIcon,
    CheckmarkCircle01Icon,
    Cancel01Icon,
    Clock01Icon,
} from "hugeicons-react";
import { cn } from "@/lib/utils";
import { RowActions } from "@/components/shared/RowActions";
import { TablePagination, usePagination } from "@/components/shared/TablePagination";
import { toast } from "sonner";
import type { AdminUser } from "@/data/admin-types";

export default function UserManagement() {
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "instructor" | "student">("all");
    const [editUser, setEditUser] = useState<AdminUser | null>(null);
    const [selectedRole, setSelectedRole] = useState<string>("");
    const [statusToggleTarget, setStatusToggleTarget] = useState<AdminUser | null>(null);

    const filteredUsers = adminUsers.filter((u) => {
        const matchesSearch =
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === "all" || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const userPage = usePagination(filteredUsers, 8);

    const roleColors = {
        admin: "bg-purple-50 text-purple-600",
        instructor: "bg-blue-50 text-blue-600",
        student: "bg-slate-50 text-slate-500",
    };

    const statusConfig = {
        active: { color: "bg-emerald-50 text-emerald-600", icon: CheckmarkCircle01Icon },
        suspended: { color: "bg-red-50 text-red-500", icon: Cancel01Icon },
        pending: { color: "bg-amber-50 text-amber-600", icon: Clock01Icon },
    };

    const roleCounts = {
        all: adminUsers.length,
        admin: adminUsers.filter((u) => u.role === "admin").length,
        instructor: adminUsers.filter((u) => u.role === "instructor").length,
        student: adminUsers.filter((u) => u.role === "student").length,
    };

    const handleRoleChange = () => {
        if (editUser && selectedRole) {
            toast.success(`Role updated for ${editUser.name}`, {
                description: `Changed from ${editUser.role} to ${selectedRole}.`,
            });
            setEditUser(null);
            setSelectedRole("");
        }
    };

    const handleToggleStatus = () => {
        if (statusToggleTarget) {
            const newStatus = statusToggleTarget.status === "active" ? "suspended" : "active";
            toast.success(`${statusToggleTarget.name} ${newStatus === "active" ? "activated" : "suspended"}`, {
                description: `Account status changed to ${newStatus}.`,
            });
            setStatusToggleTarget(null);
        }
    };

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between px-2">
                <div className="space-y-1">
                    <h1 className="text-3xl font-medium tracking-tight text-slate-800">User Management</h1>
                    <p className="text-slate-400 font-medium text-sm">View, search and manage all platform users and roles.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group lg:w-72">
                        <Search01Icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            aria-label="Search users"
                            className="h-11 w-full pl-11 pr-4 rounded-xl bg-slate-100 border-none text-sm focus:ring-2 focus:ring-primary/10 transition-all outline-none placeholder:text-slate-400"
                        />
                    </div>
                </div>
            </div>

            {/* Role Filter Tabs */}
            <div className="px-2">
                <div className="flex items-center gap-8 border-b border-slate-100">
                    {(["all", "student", "instructor", "admin"] as const).map((role) => (
                        <button
                            key={role}
                            onClick={() => setRoleFilter(role)}
                            className={cn(
                                "pb-4 text-sm font-medium transition-all relative capitalize",
                                roleFilter === role ? "text-primary" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {role === "all" ? "All Users" : `${role}s`}
                            <Badge
                                variant="secondary"
                                className={cn(
                                    "ml-2 border-none text-[10px] px-1.5 h-4",
                                    roleFilter === role ? "bg-accent/50 text-primary" : "bg-slate-50 text-slate-400"
                                )}
                            >
                                {roleCounts[role]}
                            </Badge>
                            {roleFilter === role && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Users Table */}
            {filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95 duration-500">
                    <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-6">
                        <UserMultiple02Icon size={40} />
                    </div>
                    <h2 className="text-2xl font-medium text-slate-900 mb-2">No Users Found</h2>
                    <p className="text-slate-500 max-w-sm mx-auto font-medium text-sm leading-relaxed">
                        Try adjusting your search or filter criteria.
                    </p>
                </div>
            ) : (
                <Card className="border-slate-100 rounded-2xl shadow-none mx-2">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-slate-100 hover:bg-transparent">
                                        <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">User</TableHead>
                                        <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Role</TableHead>
                                        <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Status</TableHead>
                                        <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Courses</TableHead>
                                        <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Joined</TableHead>
                                        <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {userPage.pageRows.map((user) => {
                                        const StatusIcon = statusConfig[user.status].icon;
                                        return (
                                            <TableRow key={user.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9 border border-slate-100 rounded-full">
                                                            <AvatarImage src={user.avatarUrl} />
                                                            <AvatarFallback className="bg-primary/5 text-primary text-xs font-medium">
                                                                {user.name.split(" ").map((n) => n[0]).join("")}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <span className="text-sm font-medium text-slate-800">{user.name}</span>
                                                            <p className="text-[11px] text-slate-400">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className={cn("text-[10px] font-medium border-none rounded-full capitalize px-2.5", roleColors[user.role])}>
                                                        {user.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className={cn("text-[10px] font-medium border-none rounded-full capitalize px-2.5 gap-1", statusConfig[user.status].color)}>
                                                        <StatusIcon size={10} />
                                                        {user.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-slate-600">{user.enrolledCourses}</TableCell>
                                                <TableCell className="text-sm text-slate-400">{user.joinDate}</TableCell>
                                                <TableCell className="text-right">
                                                    <RowActions
                                                        label={`Actions for ${user.name}`}
                                                        actions={[
                                                            {
                                                                label: "Change role",
                                                                icon: Edit01Icon,
                                                                onSelect: () => { setEditUser(user); setSelectedRole(user.role); },
                                                            },
                                                            {
                                                                label: "Email learner",
                                                                icon: Mail01Icon,
                                                                onSelect: () => toast.success(`Draft opened for ${user.name}`, { description: user.email }),
                                                            },
                                                            {
                                                                label: user.status === "active" ? "Suspend account" : "Activate account",
                                                                icon: user.status === "active" ? Cancel01Icon : CheckmarkCircle01Icon,
                                                                destructive: user.status === "active",
                                                                separatorBefore: true,
                                                                onSelect: () => setStatusToggleTarget(user),
                                                            },
                                                        ]}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                        <TablePagination
                            page={userPage.page}
                            pageCount={userPage.pageCount}
                            onPageChange={userPage.setPage}
                            from={userPage.from}
                            to={userPage.to}
                            total={userPage.total}
                            label="users"
                        />
                    </CardContent>
                </Card>
            )}

            {/* Role Change Dialog */}
            <Dialog open={!!editUser} onOpenChange={(open) => { if (!open) { setEditUser(null); setSelectedRole(""); } }}>
                <DialogContent className="rounded-2xl border-slate-100 shadow-xl max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-medium text-slate-900">Change Role</DialogTitle>
                        <DialogDescription className="text-slate-500 text-sm">
                            Update the role for <span className="font-medium text-slate-700">{editUser?.name}</span>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-3">
                        {(["student", "instructor", "admin"] as const).map((role) => (
                            <button
                                key={role}
                                onClick={() => setSelectedRole(role)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left",
                                    selectedRole === role
                                        ? "border-primary bg-primary/5 text-primary"
                                        : "border-slate-100 bg-white text-slate-600 hover:border-slate-200 hover:bg-slate-50"
                                )}
                            >
                                <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium", roleColors[role])}>
                                    {role[0].toUpperCase()}
                                </div>
                                <div>
                                    <span className="text-sm font-medium capitalize">{role}</span>
                                    <p className="text-[11px] text-slate-400">
                                        {role === "admin" && "Full system access"}
                                        {role === "instructor" && "Manage attendance & grading"}
                                        {role === "student" && "Standard learner access"}
                                    </p>
                                </div>
                                {selectedRole === role && (
                                    <CheckmarkCircle01Icon size={18} className="ml-auto text-primary" />
                                )}
                            </button>
                        ))}
                    </div>
                    <DialogFooter className="gap-2 sm:gap-2">
                        <DialogClose asChild>
                            <Button variant="outline" className="rounded-full h-10 border-slate-200 text-slate-500 font-normal">Cancel</Button>
                        </DialogClose>
                        <Button
                            onClick={handleRoleChange}
                            disabled={selectedRole === editUser?.role}
                            className="rounded-full h-10 bg-primary hover:bg-primary/90 text-white font-normal shadow-lg shadow-primary/10"
                        >
                            Update Role
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Suspend/Activate Confirmation */}
            <AlertDialog open={!!statusToggleTarget} onOpenChange={(open) => { if (!open) setStatusToggleTarget(null); }}>
                <AlertDialogContent className="rounded-2xl border-slate-100 shadow-xl max-w-sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg font-medium text-slate-900">
                            {statusToggleTarget?.status === "active" ? "Suspend User?" : "Activate User?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-500 text-sm">
                            {statusToggleTarget?.status === "active"
                                ? `This will suspend ${statusToggleTarget?.name}'s account. They will lose access to the platform until reactivated.`
                                : `This will reactivate ${statusToggleTarget?.name}'s account and restore full platform access.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-2">
                        <AlertDialogCancel className="rounded-full h-10 border-slate-200 text-slate-500 font-normal">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleToggleStatus}
                            className={cn(
                                "rounded-full h-10 font-normal",
                                statusToggleTarget?.status === "active"
                                    ? "bg-destructive hover:bg-destructive/90 text-white"
                                    : "bg-emerald-600 hover:bg-emerald-500 text-white"
                            )}
                        >
                            {statusToggleTarget?.status === "active" ? "Suspend Account" : "Activate Account"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}