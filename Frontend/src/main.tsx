/* eslint-disable */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from "react-router-dom";
import { ParallaxProvider } from "react-scroll-parallax";

import LandingPage from "./pages/LandingPage.tsx";
import DreamJobPage from "./pages/Careers.tsx";

import CourseCatalog from "./pages/Courses.tsx";
import CourseDetailsPage from "./pages/[courseId]/CourseDetails.tsx";
import CourseManagementAdmin from "./admin/Courses/[courseId]/CourseManagement.tsx";
import { AuthProvider, useAuthContext } from "./context/AuthProvider.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import CoursesPage from "./admin/CoursePage.tsx";
import Admin from "./admin/Admin.tsx";
import { RequireAdmin } from "./RequireInstructor.tsx";
import CourseLearningPage from "./pages/[courseId]/CourseLearner.tsx";
import MyLearning from "./pages/MyLearing.tsx";
import TestPage1 from "./pages/[testId]/TestPage1.tsx";
import AdminPanel from "./admin/AdminPanel.tsx";
import CollegeAdminPage from "./admin/[collegeId]/CollegeAdminPage.tsx";
// import CodingQuiz from "./pages/[courseId]/CodingQuiz.tsx";
import NotFound from "./pages/NotFound.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminMonitoringPage from "./admin/AdminMonitoring.tsx";
import AdminAnalysisPage from "./admin/adminAnalysis.tsx";
import AdminFaqsPage from "./admin/AdminFaq.tsx";
import FreshersReady from "./pages/FresherReady.tsx";
import TestPage from "./pages/TestPage.tsx";
import AdminAssessments from "./admin/AdminAssessments.tsx";
import AdminAttemptsAnalytics from "./admin/AdminAttemptsAnalytics.tsx";
import CompaniesPage from "./pages/Companies.tsx";
import CompanyPage from "./pages/CompanyPage.tsx";
import CompaniesAdmin from "./admin/Companies/CompaniesAdmin.tsx";
import AdminQuizPage from "./admin/AdminQuestionsHandle.tsx";
import CompanyTestTake from "./pages/CompanyTestTake.tsx";
import AdminLayout from "./admin/AdminSidepanel.tsx";
import ScrollToTop from "./scrolltotop.tsx";
import SuperAdmin from "./admin/SuperAdmin.tsx";
import ResumesPage from "./pages/ResumesPage.tsx";
import AdminResumesPage from "./admin/AdminResumes.tsx";
import LandingPage1 from "./pages/LandingPage1.tsx";
import { toast } from "sonner";

const queryClient = new QueryClient();

// Protects routes: only signed-in users
function RequireAuth() {
  const { user, loading } = useAuthContext();
  if (loading) return <p>Loading…</p>;
  return user ? <Outlet /> : <Navigate to="/Authenticate" replace />;
}
function AccessGranted() {
  const { user, loading } = useAuthContext();
  if (loading) return <p>Loading…</p>;
  return user && user.accessGranted ? (
    <Outlet />
  ) : (
    toast.error(
      "Access denied. Please contact support if you believe this is an error.",
    )
  );
}
function MyLearningWrapper() {
  const { user } = useAuthContext();
  return <MyLearning userId={user?.sub || ""} />;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // App should render <Outlet />
    children: [
      { index: true, element: <LandingPage /> },
      { path: "carrer-guidance", element: <DreamJobPage /> },
      { path: "courses", element: <CourseCatalog /> },
      { path: "freshers-pratice", element: <FreshersReady /> },
      { path: "companies", element: <CompaniesPage /> },
      { path: "land", element: <LandingPage1 /> },
      { path: "resumes", element: <ResumesPage /> },
      {
        path: "course-details/:courseId",
        element: <CourseDetailsPage />,
      },
      {
        element: <RequireAuth />, // acts as guard
        children: [
          { path: "/profile", element: <ProfilePage /> },
          {
            element: <AccessGranted />,
            children: [
              { path: "/my-learning", element: <MyLearningWrapper /> },
              { path: "companies/:slug", element: <CompanyPage /> },
              {
                path: "companies/:slug/tests/:testId",
                element: <CompanyTestTake />,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    element: <AccessGranted />, // acts as guard
    children: [
      { path: "my-courses/:courseId", element: <CourseLearningPage /> },
      { path: "my-courses/test/:testId", element: <TestPage1 /> },
      { path: "freshers-pratice/test/:id/:testId", element: <TestPage /> },
    ],
  },

  // { path: "coding-quiz/:quizId", element: <CodingQuiz /> },
  { path: "Authenticate", element: <LoginPage /> },
  {
    element: <RequireAdmin />,
    children: [
      {
        path: "admin/",
        element: <Admin />,
        children: [
          {
            path: "",
            element: <AdminLayout />,
            children: [
              { index: true, element: <AdminPanel /> },
              { path: "students", element: <AdminMonitoringPage /> },
              { path: "analytics", element: <AdminAnalysisPage /> },
              { path: "FAQ", element: <AdminFaqsPage /> },
              { path: "super-admin", element: <SuperAdmin /> },
              { path: "resumes", element: <AdminResumesPage /> },
            ],
          },
          { path: "assessments", element: <AdminAssessments /> },
          {
            path: "assessments/analytics",
            element: <AdminAttemptsAnalytics />,
          },
          { path: "clg/:collegeId", element: <CollegeAdminPage /> },
          { path: "Courses", element: <CoursesPage /> },
          { path: "companies", element: <CompaniesAdmin /> },
          { path: "quizMan", element: <AdminQuizPage /> },
          {
            path: "course-management/:courseId",
            element: <CourseManagementAdmin />,
          },
        ],
      },
    ],
  },

  { path: "*", element: <NotFound /> },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ParallaxProvider>
          <ScrollToTop />
          <RouterProvider router={router} />
        </ParallaxProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
