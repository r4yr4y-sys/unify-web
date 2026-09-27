import { useEffect, useState } from "react";
import { ArrowUpRight, BookOpen, CalendarClock, ClipboardList, GraduationCap, ListChecks, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/ui";

const api = import.meta.env.VITE_API_URL || "http://localhost:5000";
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("authToken") || ""}` });

export default function AcademicPage() {
  const [stats, setStats] = useState({ courses: "Loading…", assignments: "Loading…", exams: "Open schedule" });

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const semestersResponse = await fetch(`${api}/api/semesters`, { headers: authHeaders() });
        const semesters = await semestersResponse.json();
        const current = semesters.semesters?.find((semester) => semester.isCurrent);
        const [coursesResponse, assignmentsResponse] = await Promise.all([
          current ? fetch(`${api}/api/courses?semesterId=${current.id}`, { headers: authHeaders() }) : Promise.resolve(null),
          fetch(`${api}/api/assignments`, { headers: authHeaders() }),
        ]);
        const courses = coursesResponse ? await coursesResponse.json() : { courses: [] };
        const assignments = await assignmentsResponse.json();
        if (!active) return;
        setStats({
          courses: `${courses.courses?.length || 0} course${courses.courses?.length === 1 ? "" : "s"}`,
          assignments: `${assignments.assignments?.length || 0} assignment${assignments.assignments?.length === 1 ? "" : "s"}`,
          exams: current ? "View schedule" : "Set a semester",
        });
      } catch {
        if (active) setStats({ courses: "Unavailable", assignments: "Unavailable", exams: "Open schedule" });
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const sections = [
    { title: "Courses", copy: "Set up the courses and assessment slots for this semester.", stat: stats.courses, to: "/academic/courses", icon: BookOpen, hue: "blue" },
    { title: "Assignments", copy: "Keep briefs, due dates, and both PDFs in one place.", stat: stats.assignments, to: "/academic/assignments", icon: ClipboardList, hue: "violet" },
    { title: "Exams", copy: "See your quizzes, midterms, and finals at a glance.", stat: stats.exams, to: "/academic/exams", icon: CalendarClock, hue: "amber" },
    { title: "Routine", copy: "Plan the weekly rhythm of your classes.", stat: "Open timetable", to: "/academic/routine", icon: ListChecks, hue: "green" },
    { title: "Grades & GPA", copy: "Track results and keep your academic progress visible.", stat: "Review progress", to: "/academic/grades", icon: Trophy, hue: "pink" },
  ];

  return <section className="page academic-page academic-overview">
    <PageHeader eyebrow="Academic" title="Your academic hub" description="A clear home for the courses, deadlines, and milestones that shape your semester." />
    <section className="academic-overview__hero">
      <div><p className="eyebrow">Build a steady semester</p><h2>Know what is next, and make room to do your best work.</h2><p>Keep course plans, assignment deadlines, exam dates, and progress connected in one focused space.</p></div>
      <span aria-hidden="true"><GraduationCap size={36} /></span>
    </section>
    <div className="study-overview__heading"><div><p className="eyebrow">Academic tools</p><h2>Where would you like to begin?</h2></div><span>Your semester, in one place.</span></div>
    <div className="study-overview__grid">
      {sections.map(({ title, copy, stat, to, icon: Icon, hue }) => <Link className={`study-summary-card study-summary-card--${hue}`} to={to} key={to}><div><span className="study-summary-card__icon"><Icon size={21} /></span><ArrowUpRight size={18} /></div><h2>{title}</h2><p>{copy}</p><footer>{stat}<span>Open</span></footer></Link>)}
    </div>
  </section>;
}
