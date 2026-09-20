import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Course } from "@/data/types";
import { PlayIcon, BookOpen01Icon } from "hugeicons-react";
import { cn } from "@/lib/utils";

interface CourseCardProps {
    course: Course;
    /** Shown on the catalogue so an applicant need not reopen each course to recall. */
    applicationStatus?: "pending" | "approved" | "rejected" | "withdrawn";
}

export function CourseCard({ course, applicationStatus }: CourseCardProps) {
    const getPrice = () => {
        if (course.fees.type === 'flat') {
            return `₦${course.fees.amount?.toLocaleString()}`;
        }
        const cohortTier = course.fees.tiers?.find(t => t.name === "Cohort");
        return `₦${cohortTier?.amount.toLocaleString()}`;
    };

    const isLocked = !course.isUnlocked;
    const progress = course.progress || 0;

    return (
        <div className="group bg-white rounded-2xl md:rounded-3xl p-2 md:p-3 border border-slate-100 transition-all duration-300 flex flex-col h-full relative shadow-sm hover:shadow-md">
            {/* Image Container - Compact height */}
            <div className="relative aspect-[4/3] rounded-xl md:rounded-2xl overflow-hidden mb-2 md:mb-4 bg-slate-50">
                {course.imageUrl ? (
                    <img
                        src={course.imageUrl}
                        alt={course.title}
                        loading="lazy"
                        className="object-cover w-full h-full"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                        <BookOpen01Icon size={40} />
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="flex flex-col flex-1 px-0.5 md:px-1">
                <h3 className="text-sm md:text-lg font-medium text-slate-900 leading-tight mb-1 md:mb-1">
                    {course.title}
                </h3>

                <p className="text-slate-500 text-[10px] md:text-xs font-normal leading-relaxed mb-1.5 md:mb-2 line-clamp-2 min-h-[1.75rem] md:min-h-[2.5rem]">
                    {course.description}
                </p>

                <div className="mb-1.5 md:mb-2">
                    {isLocked ? (
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-sm md:text-xl font-medium text-primary">{getPrice()}</span>
                        </div>
                    ) : (
                        <div className="space-y-1.5 md:space-y-2">
                            <div className="flex items-center justify-between text-[8px] md:text-[10px] font-medium">
                                <span className="text-slate-400">Progress</span>
                                <span className="text-primary">{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-1 bg-slate-100" />
                        </div>
                    )}
                </div>

                {/* Meta Stats Line */}
                <div className="flex items-center flex-wrap text-[9px] md:text-[11px] font-normal text-slate-400 gap-1 mb-2">
                    <span className="hidden sm:inline">{course.duration}</span>
                    <span className="hidden sm:inline text-slate-200 text-base leading-none relative -top-[1px]">•</span>
                    <span className="truncate max-w-[70px] md:max-w-[90px]" title={course.location}>
                        {course.location.includes("ITeMS") ? "UI" : course.location}
                    </span>
                    <span className="text-slate-200 text-base leading-none relative -top-[1px]">•</span>
                    <span>{course.seats.enrolled}/{course.seats.total}</span>
                </div>

                <Link
                    to={isLocked ? `/dashboard/learning/${course.id}` : `/dashboard/player/${course.id}/${course.modules[0]?.id}/${course.modules[0]?.items[0]?.id}`}
                    className="block mt-auto"
                >
                    <Button
                        className={cn(
                            "w-full h-8 md:h-11 rounded-full font-medium text-xs md:text-sm tracking-wide transition-all duration-300 shadow-sm",
                            isLocked && applicationStatus === "pending"
                                ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                                : "bg-primary hover:bg-primary/90 text-white"
                        )}
                    >
                        {!isLocked
                            ? "Continue"
                            : applicationStatus === "pending"
                                ? "Applied"
                                : "Details"}
                        {!isLocked && <PlayIcon size={14} className="ml-1 md:ml-2" />}
                    </Button>
                </Link>
            </div>
        </div>
    );
}