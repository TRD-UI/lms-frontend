import { useState } from "react";
import { syncLogs, auditLogs } from "@/data/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Settings01Icon,
    Wifi01Icon,
    WifiOff01Icon,
    Loading01Icon,
    RotateClockwiseIcon,
    ViewIcon,
    FileSearchIcon,
    ShieldKeyIcon,
} from "hugeicons-react";
import { cn } from "@/lib/utils";
import { RowActions } from "@/components/shared/RowActions";
import { TablePagination, usePagination } from "@/components/shared/TablePagination";
import { toast } from "sonner";

export default function SystemHealth() {
    const [activeTab, setActiveTab] = useState<"sync" | "audit">("sync");
    const syncPage = usePagination(syncLogs, 8);
    const auditPage = usePagination(auditLogs, 8);

    const syncStatusConfig = {
        synced: { color: "bg-emerald-50 text-emerald-600", icon: Wifi01Icon },
        pending: { color: "bg-amber-50 text-amber-600", icon: Loading01Icon },
        failed: { color: "bg-red-50 text-red-500", icon: WifiOff01Icon },
    };

    const handleRetrySync = (log: typeof syncLogs[0]) => {
        toast.success(`Retrying sync for ${log.instructorName}`, {
            description: `Device ${log.deviceId} — ${log.recordCount} records queued.`,
        });
    };

    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between px-2">
                <div className="space-y-1">
                    <h1 className="text-3xl font-medium tracking-tight text-slate-800">System Health</h1>
                    <p className="text-slate-400 font-medium text-sm">Monitor sync status and review audit trails.</p>
                </div>
            </div>

            {/* Status Cards */}
            <div className="bg-slate-100 p-4 rounded-[2rem]">
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-none bg-white rounded-2xl shadow-none hover:shadow-sm transition-all">
                        <CardContent className="p-6 flex flex-col gap-4">
                            <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <Wifi01Icon size={20} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest leading-none">Synced Records</p>
                                <h3 className="text-2xl font-medium tracking-tight text-slate-800">
                                    {syncLogs.filter((s) => s.status === "synced").reduce((a, b) => a + b.recordCount, 0)}
                                </h3>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none bg-white rounded-2xl shadow-none hover:shadow-sm transition-all">
                        <CardContent className="p-6 flex flex-col gap-4">
                            <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                                <Loading01Icon size={20} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest leading-none">Pending Syncs</p>
                                <h3 className="text-2xl font-medium tracking-tight text-slate-800">
                                    {syncLogs.filter((s) => s.status === "pending").length}
                                </h3>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none bg-white rounded-2xl shadow-none hover:shadow-sm transition-all">
                        <CardContent className="p-6 flex flex-col gap-4">
                            <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                                <WifiOff01Icon size={20} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest leading-none">Failed Syncs</p>
                                <h3 className="text-2xl font-medium tracking-tight text-slate-800">
                                    {syncLogs.filter((s) => s.status === "failed").length}
                                </h3>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Tabs */}
            <div className="px-2">
                <div className="flex items-center gap-8 border-b border-slate-100">
                    <button
                        onClick={() => setActiveTab("sync")}
                        className={cn("pb-4 text-sm font-medium transition-all relative", activeTab === "sync" ? "text-primary" : "text-slate-400 hover:text-slate-600")}
                    >
                        Sync Logs
                        <Badge variant="secondary" className={cn("ml-2 border-none text-[10px] px-1.5 h-4", activeTab === "sync" ? "bg-accent/50 text-primary" : "bg-slate-50 text-slate-400")}>
                            {syncLogs.length}
                        </Badge>
                        {activeTab === "sync" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
                    </button>
                    <button
                        onClick={() => setActiveTab("audit")}
                        className={cn("pb-4 text-sm font-medium transition-all relative", activeTab === "audit" ? "text-primary" : "text-slate-400 hover:text-slate-600")}
                    >
                        Audit Trail
                        <Badge variant="secondary" className={cn("ml-2 border-none text-[10px] px-1.5 h-4", activeTab === "audit" ? "bg-accent/50 text-primary" : "bg-slate-50 text-slate-400")}>
                            {auditLogs.length}
                        </Badge>
                        {activeTab === "audit" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
                    </button>
                </div>
            </div>

            {/* Sync Logs Tab */}
            {activeTab === "sync" ? (
                syncLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95 duration-500">
                        <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-6">
                            <Settings01Icon size={40} />
                        </div>
                        <h2 className="text-2xl font-medium text-slate-900 mb-2">No Sync Logs</h2>
                        <p className="text-slate-500 max-w-sm mx-auto font-medium text-sm leading-relaxed">
                            Sync activity from instructor devices will appear here.
                        </p>
                    </div>
                ) : (
                    <Card className="border-slate-100 rounded-2xl shadow-none mx-2">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-slate-100 hover:bg-transparent">
                                        <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Instructor</TableHead>
                                        <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Device</TableHead>
                                        <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Timestamp</TableHead>
                                        <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Records</TableHead>
                                        <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Status</TableHead>
                                        <TableHead className="text-[10px] font-medium text-slate-400 uppercase tracking-widest text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {syncPage.pageRows.map((log) => {
                                        const StatusIcon = syncStatusConfig[log.status].icon;
                                        return (
                                            <TableRow key={log.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                <TableCell className="text-sm font-medium text-slate-800">{log.instructorName}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="bg-slate-50 text-slate-500 border-none text-[10px] font-medium rounded-full">
                                                        {log.deviceId}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-slate-400">{log.timestamp}</TableCell>
                                                <TableCell className="text-sm text-slate-600">{log.recordCount}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className={cn("text-[10px] font-medium border-none rounded-full capitalize px-2.5 gap-1", syncStatusConfig[log.status].color)}>
                                                        <StatusIcon size={10} />
                                                        {log.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <RowActions
                                                        label={`Actions for ${log.deviceId}`}
                                                        actions={[
                                                            {
                                                                label: "Retry sync",
                                                                icon: RotateClockwiseIcon,
                                                                disabled: log.status === "synced",
                                                                onSelect: () => handleRetrySync(log),
                                                            },
                                                            {
                                                                label: "View sync payload",
                                                                icon: ViewIcon,
                                                                onSelect: () =>
                                                                    toast.success(`Sync ${log.deviceId}`, {
                                                                        description: `${log.recordCount} attendance records · ${log.timestamp}`,
                                                                    }),
                                                            },
                                                        ]}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                            <TablePagination
                                page={syncPage.page}
                                pageCount={syncPage.pageCount}
                                onPageChange={syncPage.setPage}
                                from={syncPage.from}
                                to={syncPage.to}
                                total={syncPage.total}
                                label="sync records"
                            />
                        </CardContent>
                    </Card>
                )
            ) : (
                /* Audit Trail Tab */
                auditLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95 duration-500">
                        <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-6">
                            <ShieldKeyIcon size={40} />
                        </div>
                        <h2 className="text-2xl font-medium text-slate-900 mb-2">No Audit Logs</h2>
                        <p className="text-slate-500 max-w-sm mx-auto font-medium text-sm leading-relaxed">
                            Administrative actions will be recorded here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3 px-2">
                        {auditPage.pageRows.map((log) => (
                            <Card key={log.id} className="border-slate-100 rounded-2xl shadow-none hover:shadow-sm transition-all">
                                <CardContent className="p-5">
                                    <div className="flex items-start gap-4">
                                        <div className={cn("h-10 w-10 rounded-full flex items-center justify-center shrink-0", log.role === "admin" ? "bg-purple-50 text-purple-500" : "bg-blue-50 text-blue-500")}>
                                            <FileSearchIcon size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm font-medium text-slate-800">{log.action}</span>
                                                <Badge variant="secondary" className={cn("text-[9px] font-medium border-none rounded-full capitalize px-2 h-4", log.role === "admin" ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600")}>
                                                    {log.role}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">{log.details}</p>
                                            <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                                                <span>by {log.performedBy}</span>
                                                <span className="text-slate-200">•</span>
                                                <span>Target: {log.target}</span>
                                                <span className="text-slate-200">•</span>
                                                <span>{log.timestamp}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        <TablePagination
                            page={auditPage.page}
                            pageCount={auditPage.pageCount}
                            onPageChange={auditPage.setPage}
                            from={auditPage.from}
                            to={auditPage.to}
                            total={auditPage.total}
                            label="entries"
                            className="border-t-0 px-0"
                        />
                    </div>
                )
            )}
        </div>
    );
}
