import { useState } from "react";
import { Link } from "react-router-dom";
import { Search01Icon, BookOpen01Icon, FavouriteIcon } from "hugeicons-react";
import { purchasedCourseIds, courseCategories } from "@/data/courses";
import { useLms } from "@/store/lms-store";
import { CourseCard } from "@/components/dashboard/course/CourseCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function MyLearning() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All Courses");
    const [activeTab, setActiveTab] = useState<'catalog' | 'my-courses'>('catalog');

    const { courses } = useLms();
    const allCoursesWithLockState = courses.map(course => ({ ...course, isUnlocked: purchasedCourseIds.includes(course.id) }));
    const myCourses = allCoursesWithLockState.filter(c => c.isUnlocked);
    const hasPurchasedCourses = myCourses.length > 0;
    const currentCourses = activeTab === 'my-courses' ? myCourses : allCoursesWithLockState;
    const filteredCourses = currentCourses.filter((course) => {
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || course.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All Courses" || course.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = ["All Courses", ...courseCategories];

    return (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Tab Section & Header */}
            <div className="space-y-6 px-2">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-medium tracking-tight text-slate-900">
                            {activeTab === 'my-courses' ? "My Learning" : "Explore Courses"}
                        </h1>
                        <p className="text-slate-500 font-medium text-sm">
                            {activeTab === 'my-courses' ? "Continue your educational journey where you left off." : "Choose from our curated selection of premium educational paths."}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative group w-full lg:w-72">
                            <Search01Icon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by course name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-11 w-full pl-11 pr-4 rounded-xl bg-slate-100 border-none text-sm focus:ring-2 focus:ring-primary/10 transition-all outline-none placeholder:text-slate-400"
                            />
                        </div>
                    </div>
                </div>
                {hasPurchasedCourses && (
                    <div className="flex items-center gap-8 border-b border-slate-100">
                        <button
                            onClick={() => setActiveTab('catalog')}
                            className={cn(
                                "pb-4 text-sm font-medium transition-all relative",
                                activeTab === 'catalog' ? "text-primary" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            Course Catalog
                            {activeTab === 'catalog' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('my-courses')}
                            className={cn(
                                "pb-4 text-sm font-medium transition-all relative",
                                activeTab === 'my-courses' ? "text-primary" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            My Courses
                            <Badge variant="secondary" className="ml-2 bg-accent/50 text-primary border-none text-[10px] px-1.5 h-4">
                                {myCourses.length}
                            </Badge>
                            {activeTab === 'my-courses' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                            )}
                        </button>
                    </div>
                )}
            </div>
            {/* Filter Chips */}
            {activeTab === 'catalog' && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 px-2 no-scrollbar">
                    {categories.map((category) => (
                        <Badge
                            key={category}
                            variant={selectedCategory === category ? "default" : "secondary"}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-5 py-2 rounded-xl text-xs font-medium whitespace-nowrap cursor-pointer transition-all border shadow-none ${selectedCategory === category
                                    ? "bg-accent/70 text-primary hover:bg-accent/60 border-accent"
                                    : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900 border-slate-100"
                                }`}
                        >
                            {category}
                        </Badge>
                    ))}
                </div>
            )}
            {/* Grid Section */}
            {activeTab === 'catalog' ? (
                filteredCourses.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredCourses.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                        <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm">
                            <Search01Icon size={24} className="text-slate-300" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">No courses found</h3>
                        <p className="text-sm text-slate-400 max-w-xs mt-1 font-medium">Try adjusting your search or filters to find what you're looking for.</p>
                    </div>
                )
            ) : (
                myCourses.length === 0 ? (
                    <MyCoursesEmptyState />
                ) : (
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4">
                        {myCourses.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                )
            )}
        </div>
    );
}

function CatalogEmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-6">
                <BookOpen01Icon size={40} />
            </div>
            <h2 className="text-2xl font-medium text-slate-900 mb-2">No Courses Available</h2>
            <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium text-sm leading-relaxed">
                Our course catalog is being updated. Check back soon for new programmes and training opportunities.
            </p>
            <Button variant="outline" className="h-12 px-8 rounded-full font-medium border-slate-200 text-slate-600 hover:bg-slate-50">
                Notify Me When Available
            </Button>
        </div>
    );
}

function MyCoursesEmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-6">
                <FavouriteIcon size={40} />
            </div>
            <h2 className="text-2xl font-medium text-slate-900 mb-2">No Enrolled Courses</h2>
            <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium text-sm leading-relaxed">
                You haven't enrolled in any courses yet. Browse the catalog to find your next learning path.
            </p>
            <div className="flex items-center gap-3 flex-wrap justify-center">
                <Link to="/dashboard/learning">
                    <Button className="h-12 px-8 rounded-full bg-primary hover:bg-primary/90 text-white font-medium transition-all shadow-lg shadow-primary/10">
                        <BookOpen01Icon size={16} className="mr-2" /> Browse Catalog
                    </Button>
                </Link>
            </div>
        </div>
    );
}