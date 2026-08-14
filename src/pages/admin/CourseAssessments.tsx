import { Link, useParams } from "react-router-dom";
import { Task01Icon } from "hugeicons-react";
import { Button } from "@/components/ui/button";
import { AssessmentListView } from "@/components/assessments/AssessmentListView";
import { EmptyState } from "@/components/shared/EmptyState";
import { useLms } from "@/store/lms-store";
import { useActingUser } from "@/store/session";

/** Admin: every assessment under one course. */
export default function AdminCourseAssessments() {
    const { courseId } = useParams<{ courseId: string }>();
    const { getCourse } = useLms();
    const admin = useActingUser("admin");

    const course = courseId ? getCourse(courseId) : undefined;

    if (!course) {
        return (
            <EmptyState
                icon={Task01Icon}
                title="Course not found"
                description="This course may have been deleted."
                action={
                    <Link to="/admin/assessments">
                        <Button className="h-11 px-6 rounded-full bg-primary hover:bg-primary/90 text-white font-medium">
                            Back to assessments
                        </Button>
                    </Link>
                }
            />
        );
    }

    return (
        <AssessmentListView
            course={course}
            authorName={admin.name}
            backTo="/admin/assessments"
            detailBase={`/admin/assessments/${course.id}`}
            breadcrumbs={[
                { label: "Assessments", to: "/admin/assessments" },
                { label: course.title },
            ]}
        />
    );
}
