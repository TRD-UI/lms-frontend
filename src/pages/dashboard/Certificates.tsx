import { useState } from "react";
import { Link } from "react-router-dom";
import {
    LicenseIcon,
    Search01Icon,
    Download01Icon
} from "hugeicons-react";
import { Button } from "@/components/ui/button";
import type { Certificate } from "@/data/certificates";
import { useQuery } from "@tanstack/react-query";
import { fetchMyCertificates } from "@/lib/api/learner";
import { CertificateCard } from "@/components/dashboard/certificates/CertificateCard";
import { CertificateViewer } from "@/components/dashboard/certificates/CertificateViewer";

export default function Certificates() {
    const { data: certificates = [] } = useQuery({
        queryKey: ["my-certificates"],
        queryFn: fetchMyCertificates,
        staleTime: 60_000,
    });

    const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const handleView = (certificate: Certificate) => {
        setSelectedCertificate(certificate);
        setViewerOpen(true);
    };

    const filteredCertificates = certificates.filter((cert) =>
        cert.courseTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-4 sm:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Hero Section */}
            <div className="space-y-4 sm:space-y-6 px-1 sm:px-2">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-0.5 sm:space-y-1">
                        <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-slate-900">My Certificates</h1>
                        <p className="text-slate-500 font-medium text-xs sm:text-sm">View and manage your verified learning achievements.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative group w-full lg:w-72">
                            <Search01Icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search certificates..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-11 w-full pl-11 pr-4 rounded-xl bg-slate-100 border-none text-sm focus:ring-2 focus:ring-primary/10 transition-all outline-none placeholder:text-slate-400"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {certificates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-center animate-in fade-in zoom-in-95 duration-500">
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-4 sm:mb-6">
                        <LicenseIcon size={32} className="sm:hidden" />
                        <LicenseIcon size={40} className="hidden sm:block" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-medium text-slate-900 mb-1.5 sm:mb-2">No Certificates Yet</h2>
                    <p className="text-slate-500 max-w-sm mx-auto mb-6 sm:mb-8 font-medium text-xs sm:text-sm">
                        Complete your enrolled courses and excel in your assessments to earn verified certificates of achievement.
                    </p>
                    <Link to="/dashboard/learning">
                        <Button className="h-10 sm:h-12 px-6 sm:px-8 rounded-full bg-primary hover:bg-primary/90 text-white font-medium text-sm transition-all shadow-lg shadow-primary/10">
                            <Search01Icon size={18} className="mr-2" />
                            Browse Courses
                        </Button>
                    </Link>
                </div>
            ) : filteredCertificates.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4 px-1 sm:px-2">
                    {filteredCertificates.map((cert) => (
                        <CertificateCard
                            key={cert.id}
                            certificate={cert}
                            onView={handleView}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200 mx-1 sm:mx-2">
                    <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm">
                        <Search01Icon size={24} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">No certificates found</h3>
                    <p className="text-sm text-slate-400 max-w-xs mt-1 font-medium">Try adjusting your search to find what you're looking for.</p>
                </div>
            )}

            <CertificateViewer
                certificate={selectedCertificate}
                open={viewerOpen}
                onOpenChange={setViewerOpen}
            />
        </div>
    );
}
