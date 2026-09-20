import { StatsGrid } from "@/components/dashboard/overview/StatsGrid";
import { ContinueLearning } from "@/components/dashboard/overview/ContinueLearning";
import { UpcomingClasses } from "@/components/dashboard/overview/UpcomingClasses";

export default function Overview() {
    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between px-1 sm:px-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-medium tracking-tight text-slate-800">
                    Overview
                </h1>
            </div>

            <StatsGrid />

            <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-7 px-1 sm:px-2">
                <div className="lg:col-span-4">
                    <ContinueLearning />
                </div>

                <div className="lg:col-span-3">
                    <UpcomingClasses />
                </div>
            </div>
        </div>
    );
}
