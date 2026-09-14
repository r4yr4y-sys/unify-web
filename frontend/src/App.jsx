import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import { AcademicPage, DashboardPage, SettingsPage } from "./pages";
import ProfilePage from "./pages/Profile";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import CampusLifePage from "./pages/CampusLifePage";
import EventsPage from "./pages/EventsPage";
import LostFoundPage from "./pages/LostFoundPage";
import MarketplacePage from "./pages/MarketplacePage";
import NotesPage from "./pages/NotesPage";
import ResourcesPage from "./pages/ResourcesPage";
import RoutinePage from "./pages/RoutinePage";
import EditRoutinePage from "./pages/EditRoutinePage";
import StudyPage from "./pages/StudyPage";
import StudyPlansPage from "./pages/StudyPlansPage";
import FlashcardsPage from "./pages/FlashcardsPage";
import LoginPage from "./pages/LoginPage";
import LogoutPage from "./pages/LogoutPage";
import GradesPage from "./pages/GradesPage";
import StudyTimerPage from "./pages/StudyTimerPage";
import CoursesPage from "./pages/CoursesPage";
import ExamsPage from "./pages/ExamsPage";
import {
  academicRoutes,
  campusLifeRoutes,
  profileRoutes,
  settingsRoutes,
  studyRoutes,
} from "./routes/routes";
import { PageHeader, SectionCard } from "./components/ui";

function PlaceholderPage({ title }) {
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
}

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
  const plannedRoutes = [
    ...academicRoutes,
    ...studyRoutes,
    ...campusLifeRoutes,
    ...profileRoutes,
    ...settingsRoutes,
  ];
  return (
    <Routes>
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
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        {plannedRoutes
          .filter(
            ({ path }) =>
              ![
                "/academic/routine",
                "/academic/grades",
                "/academic/exams",
                "/study/notes",
                "/study/timer",
                "/study/resources",
                "/study/plans",
                "/study/flashcards",
                "/campus-life/announcements",
                "/campus-life/events",
                "/campus-life/lost-found",
                "/campus-life/marketplace",
              ].includes(path),
          )
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
  );
}
export default App;
