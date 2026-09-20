import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SessionProvider } from "@/store/session";
import { LmsProvider } from "@/store/lms-store";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { AdminLayout } from "./components/layout/AdminLayout";
import { InstructorLayout } from "./components/layout/InstructorLayout";
import { AuthLayout } from "./components/layout/AuthLayout";

// Student
import Overview from "./pages/dashboard/Overview";
import MyLearning from "./pages/dashboard/MyLearning";
import EntryPasses from "./pages/dashboard/EntryPasses";
import Certificates from "./pages/dashboard/Certificates";
import CourseDetails from "@/pages/dashboard/CourseDetails";
import CoursePlayer from "@/pages/dashboard/CoursePlayer";
import StudentAssessments from "@/pages/dashboard/Assessments";
import QuizRunner from "@/pages/dashboard/QuizRunner";
import QuizResults from "@/pages/dashboard/QuizResults";

// Admin
import Analytics from "@/pages/admin/Analytics";
import CourseManager from "@/pages/admin/CourseManager";
import AdminAssessments from "@/pages/admin/Assessments";
import AdminCourseAssessments from "@/pages/admin/CourseAssessments";
import AdminAssessmentDetail from "@/pages/admin/AssessmentDetail";
import UserManagement from "@/pages/admin/UserManagement";
import SystemHealth from "@/pages/admin/SystemHealth";

// Instructor
import InstructorDashboard from "@/pages/instructor/Dashboard";
import MyCourses from "@/pages/instructor/MyCourses";
import InstructorCourseDetail from "@/pages/instructor/CourseDetail";
import InstructorAssessmentDetail from "@/pages/instructor/AssessmentDetail";
import QRScanner from "@/pages/instructor/QRScanner";
import CohortAttendance from "@/pages/instructor/CohortAttendance";

// Auth & public
import Login from "@/pages/auth/Login";
import ResetPassword from "@/pages/auth/ResetPassword";
import StaffLogin from "@/pages/auth/StaffLogin";
import Signup from "@/pages/auth/Signup";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import LandingPage from "@/pages/LandingPage";
import NotFound from "./pages/NotFound";
import { ScrollToTop } from "@/components/ScrollToTop";
import { RequireRole, RedirectIfAuthenticated } from "@/components/auth/RequireRole";
import AccountSettings from "@/pages/settings/AccountSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SessionProvider>
      <LmsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* Landing Page */}
              <Route path="/" element={<LandingPage />} />

              {/* Auth Routes */}
              <Route path="/login" element={<RedirectIfAuthenticated><AuthLayout><Login /></AuthLayout></RedirectIfAuthenticated>} />
              <Route path="/staff-login" element={<RedirectIfAuthenticated><AuthLayout><StaffLogin /></AuthLayout></RedirectIfAuthenticated>} />
              <Route path="/signup" element={<RedirectIfAuthenticated><AuthLayout><Signup /></AuthLayout></RedirectIfAuthenticated>} />
              <Route path="/forgot-password" element={<RedirectIfAuthenticated><AuthLayout><ForgotPassword /></AuthLayout></RedirectIfAuthenticated>} />
              {/* Not wrapped: arriving here already carries a recovery session. */}
              <Route path="/reset-password" element={<AuthLayout><ResetPassword /></AuthLayout>} />

              {/* Dashboard Routes (Student) */}
              <Route path="/dashboard" element={<RequireRole allow="student"><DashboardLayout /></RequireRole>}>
                <Route index element={<Overview />} />
                <Route path="learning" element={<MyLearning />} />
                <Route path="learning/:id" element={<CourseDetails />} />
                <Route path="player/:courseId/:moduleId/:itemId" element={<CoursePlayer />} />
                <Route path="assessments" element={<StudentAssessments />} />
                <Route path="assessments/:assessmentId/take" element={<QuizRunner />} />
                <Route path="assessments/:assessmentId/result/:attemptId" element={<QuizResults />} />
                <Route path="passes" element={<EntryPasses />} />
                <Route path="certificates" element={<Certificates />} />
                <Route path="settings" element={<AccountSettings />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={<RequireRole allow="admin"><AdminLayout /></RequireRole>}>
                <Route index element={<Analytics />} />
                <Route path="courses" element={<CourseManager />} />
                <Route path="assessments" element={<AdminAssessments />} />
                <Route path="assessments/:courseId" element={<AdminCourseAssessments />} />
                <Route path="assessments/:courseId/:assessmentId" element={<AdminAssessmentDetail />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="system" element={<SystemHealth />} />
                <Route path="settings" element={<AccountSettings />} />
              </Route>

              {/* Instructor Routes */}
              <Route path="/instructor" element={<RequireRole allow="instructor"><InstructorLayout /></RequireRole>}>
                <Route index element={<InstructorDashboard />} />
                <Route path="courses" element={<MyCourses />} />
                <Route path="courses/:courseId" element={<InstructorCourseDetail />} />
                <Route path="courses/:courseId/:assessmentId" element={<InstructorAssessmentDetail />} />
                <Route path="scanner" element={<QRScanner />} />
                <Route path="attendance" element={<CohortAttendance />} />
                <Route path="settings" element={<AccountSettings />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LmsProvider>
    </SessionProvider>
  </QueryClientProvider>
);

export default App;
