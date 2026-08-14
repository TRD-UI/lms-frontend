import { Link, useParams } from "react-router-dom";
import { BookOpen01Icon } from "hugeicons-react";
import { Button } from "@/components/ui/button";
import { AssessmentListView } from "@/components/assessments/AssessmentListView";
import { EmptyState } from "@/components/shared/EmptyState";
import { useLms } from "@/store/lms-store";
import { useActingUser } from "@/store/session";

/**
 * Instructor: one course, focused on its assessments.
 *
 * Reuses the same list view the admin portal renders, so the two portals cannot
 * drift apart in behaviour.
 */
export default function InstructorCourseDetail() {
    const { courseId } = useParams<{ courseId: string }>();
    const instructor = useActingUser("instructor");
    const { getCourse } = useLms();

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

    return (
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
    );
}
