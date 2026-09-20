import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BookOpen01Icon } from "hugeicons-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { AssessmentListView } from "@/components/assessments/AssessmentListView";
import { CourseContentEditor } from "@/components/courses/CourseContentEditor";
import { EmptyState } from "@/components/shared/EmptyState";
import { useLms } from "@/store/lms-store";
import { useActingUser } from "@/store/session";
import { cn } from "@/lib/utils";

type Tab = "content" | "assessments";

/**
 * Instructor: one course — its curriculum and its assessments.
 *
 * The assessment tab reuses the same list view the admin portal renders, so the
 * two portals cannot drift apart in behaviour.
 */
export default function InstructorCourseDetail() {
    const { courseId } = useParams<{ courseId: string }>();
    const instructor = useActingUser("instructor");
    const { getCourse, assessmentsForCourse } = useLms();
    const [tab, setTab] = useState<Tab>("content");

    const course = courseId ? getCourse(courseId) : undefined;

    if (!course) {
        return (
            <EmptyState
                icon={BookOpen01Icon}
                title="Course not found"
                description="This course may have been deleted."
                action={
                    <Link to="/instructor/courses">
                        <Button className="h-11 px-6 rounded-full bg-primary hover:bg-primary/90 text-white font-medium">
                            Back to my courses
                        </Button>
                    </Link>
                }
            />
        );
    }

    const lessonCount = course.modules.reduce((s, m) => s + m.items.length, 0);
    const assessmentCount = assessmentsForCourse(course.id).length;

    const TABS: { key: Tab; label: string; count: number }[] = [
        { key: "content", label: "Content", count: lessonCount },
        { key: "assessments", label: "Assessments", count: assessmentCount },
    ];

    // The assessment tab brings its own header and breadcrumbs.
    if (tab === "assessments") {
        return (
            <div className="flex flex-col gap-4">
                <Tabs tab={tab} setTab={setTab} tabs={TABS} />
                <AssessmentListView
                    course={course}
                    authorName={instructor.name}
                    backTo="/instructor/courses"
                    detailBase={`/instructor/courses/${course.id}`}
                    breadcrumbs={[
                        { label: "My Courses", to: "/instructor/courses" },
                        { label: course.title },
                    ]}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <PageHeader
                title={course.title}
                description="Build the curriculum learners work through in the player."
                backTo="/instructor/courses"
                backLabel="My courses"
                breadcrumbs={[
                    { label: "My Courses", to: "/instructor/courses" },
                    { label: course.title },
                ]}
            />
            <Tabs tab={tab} setTab={setTab} tabs={TABS} />
            <div className="px-1 sm:px-2">
                <CourseContentEditor course={course} />
            </div>
        </div>
    );
}

function Tabs({
    tab,
    setTab,
    tabs,
}: {
    tab: Tab;
    setTab: (t: Tab) => void;
    tabs: { key: Tab; label: string; count: number }[];
}) {
    return (
        <div className="px-1 sm:px-2">
            <div className="flex items-center gap-6 sm:gap-8 border-b border-slate-100">
                {tabs.map(({ key, label, count }) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={cn(
                            "pb-3 sm:pb-4 text-xs sm:text-sm font-medium transition-all relative",
                            tab === key ? "text-primary" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        {label}
                        <span
                            className={cn(
                                "ml-2 rounded-full text-[10px] px-1.5 py-0.5",
                                tab === key ? "bg-accent/50 text-primary" : "bg-slate-50 text-slate-400"
                            )}
                        >
                            {count}
                        </span>
                        {tab === key && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
