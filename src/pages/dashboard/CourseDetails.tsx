import { useParams, Link } from "react-router-dom";
import { ArrowLeft01Icon } from "hugeicons-react";
import { useLms } from "@/store/lms-store";
import { CourseHero } from "@/components/dashboard/course-details/CourseHero";
import { CourseQuickInfo } from "@/components/dashboard/course-details/CourseQuickInfo";
import { CourseModuleList } from "@/components/dashboard/course-details/CourseModuleList";
import { EnrollmentCard } from "@/components/dashboard/course-details/EnrollmentCard";

export default function CourseDetails() {
    const { id } = useParams<{ id: string }>();
    const { courses, enrolledCourseIds } = useLms();
    const course = courses.find((c) => c.id === id);
    const isPurchased = enrolledCourseIds.includes(id || "");

    if (!course) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <h2 className="text-2xl font-medium text-slate-900">Course not found</h2>
                <Link to="/dashboard/learning" className="mt-4 text-primary font-medium hover:underline flex items-center gap-2">
                    <ArrowLeft01Icon size={20} />
                    Back to Courses
                </Link>
            </div>
        );
    }

    const getPrice = () => {
        if (course.fees.type === 'flat') {
            return `₦${course.fees.amount?.toLocaleString()}`;
        }
        const cohortTier = course.fees.tiers?.find(t => t.name === "Cohort");
        const specialTier = course.fees.tiers?.find(t => t.name === "Special");
        return {
            cohort: `₦${cohortTier?.amount.toLocaleString()}`,
            special: `₦${specialTier?.amount.toLocaleString()}`
        };
    };

    const pricing = getPrice();

    return (
        <div className="flex flex-col gap-4 sm:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CourseHero course={course} />

            <div className="grid gap-4 sm:gap-8 lg:grid-cols-3 px-1 sm:px-2 pb-20">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-4 sm:space-y-8">
                    <CourseQuickInfo course={course} />
                    <CourseModuleList course={course} isPurchased={isPurchased} />
                </div>

                {/* Sidebar / Enrollment Area */}
                <div className="lg:col-span-1">
                    <EnrollmentCard
                        course={course}
                        isPurchased={isPurchased}
                        pricing={pricing}
                    />
                </div>
            </div>
        </div>
    );
}
