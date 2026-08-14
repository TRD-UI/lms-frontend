import { Link, useNavigate, useParams } from "react-router-dom";
import { Task01Icon } from "hugeicons-react";
import { Button } from "@/components/ui/button";
import { AssessmentDetailView } from "@/components/assessments/AssessmentDetailView";
import { EmptyState } from "@/components/shared/EmptyState";
import { useLms } from "@/store/lms-store";

/** Instructor: a single assessment on one of their courses. */
export default function InstructorAssessmentDetail() {
    const { courseId, assessmentId } = useParams<{ courseId: string; assessmentId: string }>();
    const navigate = useNavigate();
    const { getCourse, getAssessment } = useLms();

    const course = courseId ? getCourse(courseId) : undefined;
    const assessment = assessmentId ? getAssessment(assessmentId) : undefined;

    if (!course || !assessment) {
        return (
            <EmptyState
                icon={Task01Icon}
                title="Assessment not found"
                description="It may have been deleted or moved to another course."
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
        <AssessmentDetailView
            assessment={assessment}
            course={course}
            onDeleted={() => navigate(`/instructor/courses/${course.id}`)}
            breadcrumbs={[
                { label: "My Courses", to: "/instructor/courses" },
                { label: course.title, to: `/instructor/courses/${course.id}` },
                { label: assessment.title },
            ]}
        />
    );
}
