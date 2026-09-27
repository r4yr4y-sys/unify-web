import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Edit3,
  GraduationCap,
  Search,
  ShoppingBag,
  Target,
  TimerReset,
} from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/ui";
import { createDashboardGreeting } from "../utils/dashboardGreeting";
import { getRoutineClasses, ROUTINE_DAYS } from "../utils/routine";

const api = import.meta.env.VITE_API_URL || "http://localhost:5000";
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
});
const request = async (path, options = {}) => {
  const response = await fetch(`${api}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...options.headers },
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.message || "Unable to load dashboard data.");
  return result;
};
const minutes = (time) => {
  const [hour, minute] = (time || "").split(":").map(Number);
  return Number.isFinite(hour) ? hour * 60 + minute : 0;
};
const todayDay = (date) => ROUTINE_DAYS[date.getDay()];
const formatTime = (time) =>
  new Date(`2000-01-01T${time}`).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
const formatDuration = (durationMs) => {
  const total = Math.round(durationMs / 60000);
  return total >= 60
    ? `${Math.floor(total / 60)}h${total % 60 ? ` ${total % 60}m` : ""}`
    : `${total}m`;
};
const dueLabel = (date) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const due = new Date(`${date}T00:00:00`);
  const days = Math.round((due - start) / 86400000);
  return days === 0
    ? "Due today"
    : days === 1
      ? "Due tomorrow"
      : days > 1 && days < 7
        ? `Due in ${days} days`
        : due.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};
const weekStart = (date = new Date()) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 1) % 7));
  return start;
};

function TodayCard({ classes, now }) {
  const afterNine = now.getHours() >= 21;
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const today = [...classes.filter((item) => item.day === todayDay(now))].sort(
    (a, b) => a.start.localeCompare(b.start),
  );
  const tomorrowClasses = [
    ...classes.filter((item) => item.day === todayDay(tomorrow)),
  ].sort((a, b) => a.start.localeCompare(b.start));
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const next = today.find((item) => minutes(item.end) >= nowMinutes);
  if (afterNine)
    return (
      <Link
        className="dashboard-card dashboard-today dashboard-link"
        to="/academic/routine"
      >
        <div className="dashboard-card__heading">
          <span className="dashboard-icon">
            <CalendarClock size={19} />
          </span>
          <p className="eyebrow">Tomorrow</p>
        </div>
        <h2>
          {tomorrowClasses.length
            ? "Classes are until tomorrow 🌙"
            : "No classes tomorrow"}
        </h2>
        {tomorrowClasses[0] ? (
          <p className="dashboard-muted">
            Tomorrow starts at{" "}
            <strong>
              {formatTime(tomorrowClasses[0].start)} —{" "}
              {tomorrowClasses[0].title}
            </strong>
          </p>
        ) : (
          <p className="dashboard-muted">You’re clear for tomorrow.</p>
        )}
        <footer>
          View tomorrow <ArrowRight size={16} />
        </footer>
      </Link>
    );
  return (
    <Link
      className="dashboard-card dashboard-today dashboard-link"
      to="/academic/routine"
    >
      <div className="dashboard-card__heading">
        <span className="dashboard-icon">
          <CalendarClock size={19} />
        </span>
        <p className="eyebrow">Today</p>
      </div>
      <h2>
        {!today.length
          ? "No classes today 🎉"
          : next
            ? "Your class day"
            : "No more classes today 🎉"}
      </h2>
      {next ? (
        <>
          <p className="dashboard-next">
            {next.title} <span>{formatTime(next.start)}</span>
          </p>
          <div className="dashboard-class-list">
            {today.slice(0, 3).map((item) => (
              <p key={item.id}>
                <time>{formatTime(item.start)}</time>
                <span>
                  {item.title}
                  {item.faculty && <small>{item.faculty}</small>}
                </span>
              </p>
            ))}
          </div>
        </>
      ) : (
        <p className="dashboard-muted">
          {today.length
            ? "Take a breather—you’re done for today."
            : "Your schedule is clear. Enjoy the space."}
        </p>
      )}
      <footer>
        Open routine <ArrowRight size={16} />
      </footer>
    </Link>
  );
}

function GoalCard({ studied, goal, onEdit, weekFinished }) {
  const complete = studied >= goal * 3600000;
  const percent = Math.min(100, Math.round((studied / (goal * 3600000)) * 100));
  const remaining = Math.max(0, goal * 3600000 - studied);
  return (
    <section
      className={`dashboard-card dashboard-goal ${complete ? "is-complete" : ""}`}
    >
      <div className="dashboard-card__heading">
        <span className="dashboard-icon">
          <Target size={19} />
        </span>
        <p className="eyebrow">Weekly study goal</p>
        <button
          type="button"
          onClick={onEdit}
          aria-label="Edit weekly study goal"
        >
          <Edit3 size={15} />
        </button>
      </div>
      {complete ? (
        <>
          <div className="dashboard-celebration">✦</div>
          <h2>Woohoo! Job well done.</h2>
          <p className="dashboard-muted">
            You studied <strong>{formatDuration(studied)}</strong> this week and
            crushed your {goal}-hour goal.
          </p>
        </>
      ) : weekFinished ? (
        <>
          <h2>Not bad! 💪</h2>
          <p className="dashboard-muted">
            You studied <strong>{formatDuration(studied)}</strong> this week.
            You didn’t quite reach your {goal}-hour goal—there’s a fresh start
            tomorrow.
          </p>
        </>
      ) : (
        <>
          <h2>
            {formatDuration(studied)} <span>/ {goal}h</span>
          </h2>
          <div className="dashboard-progress">
            <span style={{ width: `${percent}%` }} />
          </div>
          <p className="dashboard-muted">
            {percent}% complete · {formatDuration(remaining)} remaining
          </p>
        </>
      )}
      <button className="dashboard-text-action" type="button" onClick={onEdit}>
        {complete ? "Adjust next week’s goal" : "Edit goal"}
      </button>
    </section>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState({
    profile: null,
    assignments: [],
    courses: [],
    sessions: [],
    goal: 16,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [now, setNow] = useState(new Date());
  const [goalOpen, setGoalOpen] = useState(false);
  const [goalDraft, setGoalDraft] = useState(16);
  const load = async () => {
    try {
      const [profile, semesters, assignments, sessions, preferences] =
        await Promise.all([
          request("/api/profile"),
          request("/api/semesters"),
          request("/api/assignments"),
          request("/api/study-sessions"),
          request("/api/dashboard-preferences"),
        ]);
      const current = semesters.semesters.find(
        (semester) => semester.isCurrent,
      );
      const courses = current
        ? await request(`/api/courses?semesterId=${current.id}`)
        : { courses: [] };
      setData({
        profile: profile.user,
        assignments: assignments.assignments || [],
        courses: courses.courses || [],
        sessions: sessions.sessions || [],
        goal: preferences.weeklyStudyGoalHours || 16,
      });
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
    const interval = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(interval);
  }, []);
  const weekSessions = useMemo(() => {
    const start = weekStart();
    return data.sessions.filter(
      (session) => new Date(session.startedAt) >= start,
    );
  }, [data.sessions]);
  const studied = weekSessions.reduce(
    (sum, session) => sum + session.durationMs,
    0,
  );
  const upcomingAssignments = data.assignments
    .filter(
      (assignment) =>
        assignment.dueDate &&
        new Date(`${assignment.dueDate}T00:00:00`) >=
          new Date(new Date().setHours(0, 0, 0, 0)),
    )
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 3);
  const attendance = useMemo(() => {
    const records = data.courses
      .flatMap((course) => course.attendance || [])
      .filter((item) => item.status === "attended" || item.status === "missed");
    return records.length
      ? Math.round(
          (records.filter((item) => item.status === "attended").length /
            records.length) *
            100,
        )
      : null;
  }, [data.courses]);
  const exams = data.courses.flatMap((course) =>
    (course.assessments || []).filter(
      (item) =>
        item.date &&
        new Date(`${item.date}T00:00:00`) >=
          new Date(new Date().setHours(0, 0, 0, 0)) &&
        item.status !== "completed",
    ),
  ).length;
  const saveGoal = async (event) => {
    event.preventDefault();
    try {
      const result = await request("/api/dashboard-preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weeklyStudyGoalHours: Number(goalDraft) }),
      });
      setData((current) => ({ ...current, goal: result.weeklyStudyGoalHours }));
      setGoalOpen(false);
    } catch (saveError) {
      setError(saveError.message);
    }
  };
  if (loading)
    return (
      <section className="page dashboard-page">
        <PageHeader
          eyebrow="Unify workspace"
          title="Loading your dashboard…"
          description="Preparing today’s overview."
        />
        <div className="dashboard-loading">
          <span />
          <span />
          <span />
        </div>
      </section>
    );
  return (
    <section className="page dashboard-page">
      <PageHeader
        eyebrow="Unify workspace"
        title={createDashboardGreeting(data.profile?.profile?.name || "there")}
        description="Here’s what’s happening today."
      />
      {error && <p className="courses-error">{error}</p>}
      <div className="dashboard-grid">
        <TodayCard classes={getRoutineClasses()} now={now} />
        <Link
          className="dashboard-card dashboard-assignments dashboard-link"
          to="/academic/assignments"
        >
          <div className="dashboard-card__heading">
            <span className="dashboard-icon dashboard-icon--violet">
              <ClipboardList size={19} />
            </span>
            <p className="eyebrow">Upcoming assignments</p>
          </div>
          <h2>
            {upcomingAssignments.length
              ? "Keep the deadlines close"
              : "You’re all caught up! 🎉"}
          </h2>
          {upcomingAssignments.length ? (
            <div className="dashboard-assignment-list">
              {upcomingAssignments.map((assignment) => (
                <p key={assignment.id}>
                  <span>
                    <strong>
                      {assignment.course?.code ||
                        assignment.course?.title ||
                        "Course"}
                    </strong>
                    {assignment.topic || `Assignment ${assignment.number}`}
                  </span>
                  <small>{dueLabel(assignment.dueDate)}</small>
                </p>
              ))}
            </div>
          ) : (
            <p className="dashboard-muted">No upcoming assignments.</p>
          )}
          <footer>
            View all <ArrowRight size={16} />
          </footer>
        </Link>
        <GoalCard
          studied={studied}
          goal={data.goal}
          weekFinished={now.getDay() === 5 && now.getHours() >= 21}
          onEdit={() => {
            setGoalDraft(data.goal);
            setGoalOpen(true);
          }}
        />
        <Link
          className="dashboard-card dashboard-attendance dashboard-link"
          to="/academic/courses"
        >
          <div className="dashboard-card__heading">
            <span className="dashboard-icon dashboard-icon--green">
              <GraduationCap size={19} />
            </span>
            <p className="eyebrow">Attendance</p>
          </div>
          {attendance === null ? (
            <>
              <h2>Attendance awaits</h2>
              <p className="dashboard-muted">
                Mark classes in Courses to see this semester’s progress.
              </p>
            </>
          ) : (
            <>
              <h2>{attendance}%</h2>
              <div className="dashboard-progress dashboard-progress--green">
                <span style={{ width: `${attendance}%` }} />
              </div>
              <p className="dashboard-muted">This semester</p>
            </>
          )}
          <footer>
            Open courses <ArrowRight size={16} />
          </footer>
        </Link>
        <section className="dashboard-card dashboard-week">
          <div className="dashboard-card__heading">
            <span className="dashboard-icon dashboard-icon--amber">
              <Clock3 size={19} />
            </span>
            <p className="eyebrow">This week</p>
          </div>
          <div className="dashboard-week-links">
            <Link to="/study/timer">
              <TimerReset size={17} />
              <span>
                Study hours<small>{formatDuration(studied)}</small>
              </span>
              <ArrowRight size={15} />
            </Link>
            <Link to="/academic/assignments">
              <ClipboardList size={17} />
              <span>
                Assignments<small>{upcomingAssignments.length} pending</small>
              </span>
              <ArrowRight size={15} />
            </Link>
            <Link to="/academic/exams">
              <BookOpen size={17} />
              <span>
                Exams
                <small>
                  {exams ? `${exams} upcoming` : "No upcoming exams"}
                </small>
              </span>
              <ArrowRight size={15} />
            </Link>
            <Link to="/study">
              <CheckCircle2 size={17} />
              <span>
                Progress<small>Study</small>
              </span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </section>
        <Link
          className="dashboard-card dashboard-promo dashboard-market dashboard-link"
          to="/campus-life/marketplace"
        >
          <ShoppingBag size={23} />
          <p className="eyebrow">Marketplace</p>
          <h2>Find something useful.</h2>
          <p className="dashboard-muted">
            See what students are selling today.
          </p>
          <footer>
            Explore marketplace <ArrowRight size={16} />
          </footer>
        </Link>
        <Link
          className="dashboard-card dashboard-promo dashboard-lost dashboard-link"
          to="/campus-life/lost-found"
        >
          <Search size={23} />
          <p className="eyebrow">Lost & found</p>
          <h2>Looking for something?</h2>
          <p className="dashboard-muted">Check recent campus posts.</p>
          <footer>
            Visit Lost & Found <ArrowRight size={16} />
          </footer>
        </Link>
      </div>
      {goalOpen && (
        <div className="dashboard-goal-backdrop">
          <form className="dashboard-goal-modal" onSubmit={saveGoal}>
            <p className="eyebrow">Weekly study goal</p>
            <h2>Choose your target</h2>
            <label>
              Hours each week
              <input
                type="number"
                min="1"
                max="168"
                step="0.25"
                value={goalDraft}
                onChange={(event) => setGoalDraft(event.target.value)}
                autoFocus
              />
            </label>
            <footer>
              <button type="button" onClick={() => setGoalOpen(false)}>
                Cancel
              </button>
              <button type="submit">Save goal</button>
            </footer>
          </form>
        </div>
      )}
    </section>
  );
}
