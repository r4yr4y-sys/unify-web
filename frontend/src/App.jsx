import { lazy, memo, Suspense, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const AcademicPage = lazy(() => import("./pages/AcademicPage"));
const ProfilePage = lazy(() => import("./pages/Profile"));
const AnnouncementsPage = lazy(() => import("./pages/AnnouncementsPage"));
const CampusLifePage = lazy(() => import("./pages/CampusLifePage"));
const EventsPage = lazy(() => import("./pages/EventsPage"));
const LostFoundPage = lazy(() => import("./pages/LostFoundPage"));
const MarketplacePage = lazy(() => import("./pages/MarketplacePage"));
const NotesPage = lazy(() => import("./pages/NotesPage"));
const ResourcesPage = lazy(() => import("./pages/ResourcesPage"));
const RoutinePage = lazy(() => import("./pages/RoutinePage"));
const EditRoutinePage = lazy(() => import("./pages/EditRoutinePage"));
const StudyPage = lazy(() => import("./pages/StudyPage"));
const StudyPlansPage = lazy(() => import("./pages/StudyPlansPage"));
const FlashcardsPage = lazy(() => import("./pages/FlashcardsPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const LogoutPage = lazy(() => import("./pages/LogoutPage"));
const GradesPage = lazy(() => import("./pages/GradesPage"));
const StudyTimerPage = lazy(() => import("./pages/StudyTimerPage"));
const CoursesPage = lazy(() => import("./pages/CoursesPage"));
const ExamsPage = lazy(() => import("./pages/ExamsPage"));
const AssignmentsPage = lazy(() => import("./pages/AssignmentsPage"));
const EmptyRoomsPage = lazy(() => import("./pages/EmptyRoomsPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const SupportPage = lazy(() => import("./pages/SupportPage"));
import {
  academicRoutes,
  campusLifeRoutes,
  profileRoutes,
  settingsRoutes,
  studyRoutes,
} from "./routes/routes";
import { PageHeader, SectionCard } from "./components/ui";

const plannedRoutes = [
  ...academicRoutes,
  ...studyRoutes,
  ...campusLifeRoutes,
  ...profileRoutes,
  ...settingsRoutes,
];

const fallbackRoutes = new Set([
  "/academic/routine", "/academic/grades", "/academic/exams",
  "/academic/assignments", "/study/notes", "/study/timer",
  "/study/resources", "/study/plans", "/study/flashcards",
  "/campus-life/announcements", "/campus-life/events",
  "/campus-life/lost-found", "/campus-life/marketplace",
  "/campus-life/empty-rooms",
]);

const PlaceholderPage = memo(function PlaceholderPage({ title }) {
  return (
    <section className="page">
      <PageHeader
        eyebrow="Unify workspace"
        title={title}
        description="This area is planned for a future iteration."
      />
      <SectionCard title="Coming soon">
        <p className="empty-state">
          The foundations are in place for this feature.
        </p>
      </SectionCard>
    </section>
  );
});

function RequireAuth({ children }) {
  const token = localStorage.getItem("authToken");
  const location = useLocation();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!token) {
      setStatus("signed-out");
      return undefined;
    }
    let active = true;
    fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/profile`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    )
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        if (active)
          setStatus(result.user.profileCompleted ? "complete" : "incomplete");
      })
      .catch(() => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        if (active) setStatus("signed-out");
      });
    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    const handleProfileUpdate = (event) => {
      if (event.detail?.profileCompleted) setStatus("complete");
    };
    window.addEventListener("unify-profile-updated", handleProfileUpdate);
    return () =>
      window.removeEventListener("unify-profile-updated", handleProfileUpdate);
  }, []);

  if (status === "loading")
    return <main className="logout-page">Loading your account…</main>;
  if (status === "signed-out") return <Navigate to="/login" replace />;
  if (status === "incomplete" && location.pathname !== "/profile")
    return <Navigate to="/profile" replace />;
  return children;
}

function App() {
  return (
    <Suspense fallback={<main className="logout-page">Loading page…</main>}>
      <Routes>
        <Route path="/admin/*" element={<AdminPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/logout" element={<LogoutPage />} />
        <Route
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/academic" element={<AcademicPage />} />
        <Route path="/academic/courses" element={<CoursesPage />} />
        <Route path="/academic/routine" element={<RoutinePage />} />
        <Route path="/academic/routine/edit" element={<EditRoutinePage />} />
        <Route path="/academic/grades" element={<GradesPage />} />
        <Route path="/academic/exams" element={<ExamsPage />} />
        <Route path="/academic/assignments" element={<AssignmentsPage />} />
        <Route path="/study" element={<StudyPage />} />
        <Route path="/study/timer" element={<StudyTimerPage />} />
        <Route path="/study/notes" element={<NotesPage />} />
        <Route path="/study/resources" element={<ResourcesPage />} />
        <Route path="/study/plans" element={<StudyPlansPage />} />
        <Route path="/study/flashcards" element={<FlashcardsPage />} />
        <Route path="/campus-life" element={<CampusLifePage />} />
        <Route
          path="/campus-life/announcements"
          element={<AnnouncementsPage />}
        />
        <Route path="/campus-life/events" element={<EventsPage />} />
        <Route path="/campus-life/lost-found" element={<LostFoundPage />} />
        <Route path="/campus-life/marketplace" element={<MarketplacePage />} />
        <Route path="/campus-life/empty-rooms" element={<EmptyRoomsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SupportPage />} />
        {plannedRoutes
          .filter(({ path }) => !fallbackRoutes.has(path))
          .map(({ path, title }) => (
            <Route
              key={path}
              path={path}
              element={<PlaceholderPage title={title} />}
            />
          ))}
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}
export default App;
