import { useNavigate } from "react-router-dom";
import {
    Archive01Icon,
    PlayIcon,
    InformationCircleIcon,
    CallIcon
} from "hugeicons-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Course } from "@/data/types";
// Enrolment rules, facilities and phone numbers are institution copy with no
// table behind them. The application fee is per-course and comes from the row.
import { courseMetadata } from "@/data/courses";
import { useQuery } from "@tanstack/react-query";
import { fetchApplicationFee } from "@/lib/api/courses";

interface EnrollmentCardProps {
    course: Course;
    isPurchased: boolean;
    pricing: string | { cohort: string; special: string };
}

export function EnrollmentCard({ course, isPurchased, pricing }: EnrollmentCardProps) {
    const navigate = useNavigate();
    const { data: applicationFee = 0 } = useQuery({
        queryKey: ["application-fee", course.id],
        queryFn: () => fetchApplicationFee(course.id),
        staleTime: 5 * 60_000,
    });

    return (
        <div className="space-y-4 sm:space-y-6">
            {isPurchased ? (
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 p-5 sm:p-8 space-y-4 sm:space-y-6 sticky top-3">
                    <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
                        <Archive01Icon size={24} className="sm:hidden" />
                        <Archive01Icon size={32} className="hidden sm:block" />
                    </div>
                    <div className="text-center space-y-1 sm:space-y-2">
                        <h3 className="text-lg sm:text-xl font-medium text-slate-900">Enrolled Course</h3>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium">You have full access to this course's materials and lessons.</p>
                    </div>
                    <Button
                        onClick={() => navigate(`/dashboard/player/${course.id}/${course.modules[0]?.id}/${course.modules[0]?.items[0]?.id}`)}
                        className="w-full h-11 sm:h-14 rounded-full bg-primary hover:bg-primary/90 text-white font-medium text-sm sm:text-base transition-all shadow-lg shadow-primary/5"
                    >
                        Continue Learning
                        <PlayIcon size={18} className="ml-2" />
                    </Button>
                </div>
            ) : (
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 p-5 sm:p-8 space-y-4 sm:space-y-5 sticky top-3">
                    <div className="space-y-3 sm:space-y-4 text-left">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Course Fee</span>
                            {typeof pricing === 'string' ? (
                                <span className="text-3xl sm:text-4xl font-medium text-primary">{pricing}</span>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200">
                                        <span className="text-xs font-medium text-slate-500">Cohort</span>
                                        <span className="text-lg sm:text-xl font-medium text-primary">{pricing.cohort}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200">
                                        <span className="text-xs font-medium text-slate-500">Special</span>
                                        <span className="text-lg sm:text-xl font-medium text-primary">{pricing.special}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center justify-between text-xs sm:text-sm py-3 sm:py-4 border-y border-slate-100 font-medium">
                            <span className="text-slate-400">Application Form</span>
                            <span className="text-slate-900">₦{applicationFee.toLocaleString()}</span>
                        </div>
                    </div>

                    <Button className="w-full h-11 sm:h-14 rounded-full bg-primary hover:bg-primary/90 text-white font-medium text-sm sm:text-base transition-all shadow-lg shadow-primary/5">
                        Apply for Admission
                    </Button>

                    <Accordion type="multiple" className="w-full space-y-2 border-t border-slate-100 pt-3">
                        <AccordionItem value="enrollment" className="border-none">
                            <AccordionTrigger className="py-3 hover:no-underline hover:text-primary transition-colors text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                                <div className="flex items-center gap-2">
                                    <InformationCircleIcon size={14} className="text-primary" />
                                    Enrollment Info
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 space-y-3">
                                <p className="text-[11px] text-slate-500 font-normal leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                                    {courseMetadata.enrollmentRule}
                                </p>
                                <p className="text-[11px] text-slate-500 font-normal leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                                    {courseMetadata.specialPackageRule}
                                </p>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="enquiries" className="border-none">
                            <AccordionTrigger className="py-3 hover:no-underline hover:text-primary transition-colors text-[10px] font-medium text-slate-400 uppercase tracking-widest text-left">
                                <div className="flex items-center gap-2">
                                    <CallIcon size={14} className="text-primary" />
                                    Enquiries
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-1">
                                <div className="divide-y divide-slate-100">
                                    {courseMetadata.contacts.map((contact) => (
                                        <a key={contact} href={`tel:${contact}`} className="text-sm font-medium text-slate-700 hover:text-primary transition-colors flex items-center justify-between py-3 px-1">
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                {contact}
                                            </div>
                                            <CallIcon size={14} className="text-slate-300" />
                                        </a>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            )}
        </div>
    );
}
