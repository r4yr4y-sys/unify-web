import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import {
  AcademicPage,
  AnnouncementsPage,
  CampusLifePage,
  DashboardPage,
  EventsPage,
  LostFoundPage,
  MarketplacePage,
  NotesPage,
  ProfilePage,
  ResourcesPage,
  RoutinePage,
  SettingsPage,
  StudyPage,
  StudyPlansPage,
} from "./pages";
import LoginPage from "./pages/LoginPage";
import GradesPage from "./pages/GradesPage";
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
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/academic" element={<AcademicPage />} />
        <Route path="/academic/routine" element={<RoutinePage />} />
        <Route path="/academic/grades" element={<GradesPage />} />
        <Route path="/study" element={<StudyPage />} />
        <Route path="/study/notes" element={<NotesPage />} />
        <Route path="/study/resources" element={<ResourcesPage />} />
        <Route path="/study/plans" element={<StudyPlansPage />} />
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
                "/study/notes",
                "/study/resources",
                "/study/plans",
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
