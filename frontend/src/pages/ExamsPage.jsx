import { useEffect, useMemo, useState } from "react";
import { CalendarClock } from "lucide-react";
import { PageHeader } from "../components/ui";
import ExamCourseCard from "../components/exams/ExamCourseCard";
import ExamBracket from "../components/exams/ExamBracket";
import AssessmentDateModal from "../components/exams/AssessmentDateModal";

const api = import.meta.env.VITE_API_URL || "http://localhost:5000";
const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("authToken")}` });
const request = async (path, options = {}) => {
  const response = await fetch(`${api}${path}`, { ...options, headers: { ...headers(), ...options.headers } });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Unable to update assessment.");
  return result;
};

export default function ExamsPage() {
  const [semester, setSemester] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = async () => {
    try {
      const semesters = await request("/api/semesters");
      const current = semesters.semesters.find((item) => item.isCurrent) || null;
      setSemester(current);
      if (!current) return setCourses([]);
      const result = await request(`/api/courses?semesterId=${current.id}`);
      setCourses(result.courses);
    } catch (loadError) { setError(loadError.message); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  const theoryCourses = useMemo(() => courses.filter((course) => course.courseType === "theory"), [courses]);
  const labCourses = useMemo(() => courses.filter((course) => course.courseType === "lab"), [courses]);
  const updateAssessment = async (course, assessment, changes) => {
    const assessments = course.assessments.map((item) => item.id === assessment.id ? { ...item, ...changes } : item);
    try {
      const result = await request(`/api/courses/${course.id}`, { method: "PUT", body: JSON.stringify({ assessments }) });
      setCourses((items) => items.map((item) => item.id === course.id ? result.course : item));
      window.dispatchEvent(new Event("unify-assessments-updated"));
      setSelected(null); setError("");
    } catch (updateError) { setError(updateError.message); }
  };
  const toggle = (course, assessment) => updateAssessment(course, assessment, { status: assessment.status === "completed" ? "pending" : "completed" });
  const openCourse = (course) => setSelected(course);
  return <section className="page exams-page">
    <PageHeader eyebrow="Academic" title="Exams" description={semester ? `Current semester: ${semester.name}` : "Create and activate a semester to track exams."} />
    {error && <p className="courses-error">{error}</p>}
    {loading ? <p>Loading assessments…</p> : !semester ? <section className="exams-empty"><CalendarClock size={24} /><h2>No active semester</h2><p>Create a current semester and add courses to start tracking exams.</p></section> : <>
      {!theoryCourses.length && !labCourses.length && <section className="exams-empty"><CalendarClock size={24} /><h2>No classified courses yet</h2><p>Set each course to Theory or Lab from its course details to show it here.</p></section>}
      {theoryCourses.length > 0 && <section className="exam-section"><div className="exam-section__heading"><p className="eyebrow">Current semester</p><h2>Theory courses</h2></div><div className="exam-course-grid">{theoryCourses.map((course) => <ExamCourseCard key={course.id} course={course} onToggle={toggle} onOpen={openCourse} />)}</div></section>}
      {labCourses.length > 0 && <section className="exam-section"><div className="exam-section__heading"><p className="eyebrow">Current semester</p><h2>Lab courses</h2></div><div className="exam-course-grid">{labCourses.map((course) => <ExamCourseCard key={course.id} course={course} onToggle={toggle} onOpen={openCourse} />)}</div></section>}
      <section className="exam-bracket-grid">
        <ExamBracket title="Midterm" courses={theoryCourses} type="midterm" onToggle={toggle} />
        <ExamBracket title="Semester Final" courses={theoryCourses} type="final" onToggle={toggle} />
      </section>
    </>}
    {selected && <AssessmentDateModal course={selected} onClose={() => setSelected(null)} onSave={(assessment, changes) => updateAssessment(selected, assessment, changes)} />}
  </section>;
}
