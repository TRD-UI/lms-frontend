import { useQuery } from "@tanstack/react-query";
import {
    BookOpen01Icon,
    Mortarboard01Icon,
    Certificate01Icon,
    Calendar03Icon,
} from "hugeicons-react";
import { Card, CardContent } from "@/components/ui/card";
import { fetchLearnerStats } from "@/lib/api/learner";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export function StatsGrid() {
    const { data } = useQuery({
        queryKey: ["learner-stats"],
        queryFn: fetchLearnerStats,
        staleTime: 60_000,
    });

    const dashboardStats = [
        { title: "Current Enrollments", value: String(data?.activeEnrollments ?? 0), icon: BookOpen01Icon },
        { title: "Completed Courses", value: String(data?.completedCourses ?? 0), icon: Mortarboard01Icon },
        { title: "Certificates Earned", value: String(data?.certificates ?? 0), icon: Certificate01Icon },
        {
            title: "Next Class",
            value: data?.nextClass ? data.nextClass.date : "—",
            icon: Calendar03Icon,
        },
    ];

    return (
        <div className="mb-12 md:mb-0">
            <div className="bg-slate-100 p-2 md:p-4 rounded-2xl md:rounded-[2rem] overflow-hidden">
            <style>
                {`
                    .stats-swiper .swiper-pagination {
                        position: relative;
                        margin-top: 10px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        width: 100%;
                    }
                    .stats-swiper .swiper-pagination-bullet {
                        background: #cbd5e1;
                        opacity: 1;
                        width: 6px;
                        height: 6px;
                        border-radius: 9999px;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        margin: 0 4px !important;
                    }
                    .stats-swiper .swiper-pagination-bullet-active {
                        background: #2563eb;
                        width: 24px;
                        border-radius: 9999px;
                    }
                `}
            </style>

            {/* Desktop Grid */}
            <div className="hidden md:grid gap-4 md:grid-cols-4">
                {dashboardStats.map((stat) => (
                    <Card key={stat.title} className="border-none bg-white rounded-2xl overflow-hidden shadow-none transition-all hover:shadow-sm">
                        <CardContent className="p-6 flex flex-col gap-4 text-primary">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <stat.icon size={20} />
                            </div>

                            <div className="flex flex-col gap-1">
                                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest leading-none">
                                    {stat.title}
                                </p>
                                <h3 className="text-2xl font-medium tracking-tight text-slate-800">{stat.value}</h3>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Mobile Swiper */}
            <div className="md:hidden">
                <Swiper
                    modules={[Autoplay, Pagination]}
                    spaceBetween={12}
                    slidesPerView={1}
                    autoplay={{ delay: 5000, disableOnInteraction: false }}
                    pagination={{ clickable: true }}
                    className="stats-swiper"
                >
                    {dashboardStats.map((stat) => (
                        <SwiperSlide key={stat.title}>
                            <Card className="border-none bg-white rounded-2xl overflow-hidden shadow-sm">
                                <CardContent className="p-4 flex flex-col gap-3 text-primary">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <stat.icon size={20} />
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest leading-none">
                                            {stat.title}
                                        </p>
                                        <h3 className="text-2xl font-medium tracking-tight text-slate-800">{stat.value}</h3>
                                    </div>
                                </CardContent>
                            </Card>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
        </div>
    );
}
