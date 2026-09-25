import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, Download, FileText, Pencil, Plus, Upload, X } from "lucide-react";
import { Button, PageHeader } from "../components/ui";

const api = import.meta.env.VITE_API_URL || "http://localhost:5000";
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("authToken") || ""}` });
const jsonRequest = async (path, options = {}) => {
  const response = await fetch(`${api}${path}`, { ...options, headers: { "Content-Type": "application/json", ...authHeaders(), ...options.headers } });
  const result = response.status === 204 ? {} : await response.json();
  if (!response.ok) throw new Error(result.message || "Unable to save assignment.");
  return result;
};
const dateLabel = (date) => date ? new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "No due date";

function AssignmentModal({ assignment, course, onClose, onSave }) {
  const [topic, setTopic] = useState(assignment?.topic || "");
  const [dueDate, setDueDate] = useState(assignment?.dueDate || "");
  const [error, setError] = useState("");
  const submit = async (event) => { event.preventDefault(); try { await onSave({ topic, dueDate }); onClose(); } catch (err) { setError(err.message); } };
  return <div className="assignment-modal-backdrop"><form className="assignment-modal" onSubmit={submit}>
    <button className="assignment-modal__close" type="button" onClick={onClose} aria-label="Close assignment dialog"><X size={18} /></button>
    <p className="eyebrow">{course.code} · Assignment {assignment?.number || "new"}</p><h2>{assignment ? "Edit assignment" : "Add assignment"}</h2>
    <label>Topic / instructions<textarea value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="What is this assignment about?" /></label><label>Due date<input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></label>
    {error && <p className="courses-error">{error}</p>}<footer><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit">Save assignment</Button></footer>
  </form></div>;
}

function PdfAction({ assignment, kind, label, icon: Icon, onUploaded, onError }) {
  const file = assignment[kind === "question-paper" ? "questionPaper" : "completedAssignment"];
  const [busy, setBusy] = useState(false);
  const upload = async (event) => {
    const selected = event.target.files?.[0]; event.target.value = ""; if (!selected) return; setBusy(true);
    try { const data = new FormData(); data.append("file", selected); const response = await fetch(`${api}/api/assignments/${assignment.id}/${kind}`, { method: "POST", headers: authHeaders(), body: data }); const result = await response.json(); if (!response.ok) throw new Error(result.message || "Unable to upload PDF."); onUploaded(result.assignment); } catch (error) { onError(error.message); } finally { setBusy(false); }
  };
  const download = async () => {
    try { const response = await fetch(`${api}/api/assignments/${assignment.id}/${kind}/download`, { headers: authHeaders() }); if (!response.ok) { const result = await response.json(); throw new Error(result.message || "Unable to download PDF."); } const url = URL.createObjectURL(await response.blob()); const link = document.createElement("a"); link.href = url; link.download = file.originalName; link.click(); URL.revokeObjectURL(url); } catch (error) { onError(error.message); }
  };
  return <div className={`assignment-file ${file ? "is-ready" : ""}`}><span><Icon size={17} /><strong>{label}</strong><small>{file ? file.originalName : "Not uploaded"}</small></span><div className="assignment-file__actions">{file && <button type="button" onClick={download} title={`Download ${label}`}><Download size={16} /></button>}<label title={`${file ? "Replace" : "Upload"} ${label}`}><Upload size={16} /><input type="file" accept="application/pdf,.pdf" onChange={upload} disabled={busy} /></label></div></div>;
}

function AssignmentCard({ assignment, course, onEdit, onRemove, onUploaded, onError }) {
  return <article className="assignment-card"><div className="assignment-card__top"><span>Assignment {assignment.number}</span><div><button type="button" onClick={() => onEdit({ course, assignment })} title="Edit assignment"><Pencil size={15} /></button><button type="button" className="assignment-card__delete" onClick={() => onRemove(assignment)} title="Delete assignment"><X size={16} /></button></div></div><h4>{assignment.topic || "Topic not added yet"}</h4><p className={assignment.dueDate ? "assignment-card__due" : "assignment-card__due is-empty"}>Due {dateLabel(assignment.dueDate)}</p><PdfAction assignment={assignment} kind="question-paper" label="Question paper" icon={FileText} onUploaded={onUploaded} onError={onError} /><PdfAction assignment={assignment} kind="completed" label="Completed PDF" icon={CheckCircle2} onUploaded={onUploaded} onError={onError} /></article>;
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState([]); const [courses, setCourses] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [editing, setEditing] = useState(null); const [expandedCourses, setExpandedCourses] = useState(() => new Set());
  const load = async () => { try { const [assignmentData, semesterData] = await Promise.all([jsonRequest("/api/assignments"), jsonRequest("/api/semesters")]); setAssignments(assignmentData.assignments); const current = semesterData.semesters.find((item) => item.isCurrent); if (current) { const data = await jsonRequest(`/api/courses?semesterId=${current.id}`); setCourses(data.courses); } } catch (err) { setError(err.message); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const groups = useMemo(() => ["theory", "lab"].map((type) => ({ type, courses: courses.filter((course) => course.courseType === type) })), [courses]);
  const replace = (next) => { setAssignments((items) => items.some((item) => item.id === next.id) ? items.map((item) => item.id === next.id ? next : item) : [...items, next]); window.dispatchEvent(new Event("unify-assignments-updated")); };
  const save = async (course, payload, assignment) => { const result = assignment ? await jsonRequest(`/api/assignments/${assignment.id}`, { method: "PUT", body: JSON.stringify(payload) }) : await jsonRequest("/api/assignments", { method: "POST", body: JSON.stringify({ ...payload, courseId: course.id }) }); replace(result.assignment); };
  const remove = async (assignment) => { if (!window.confirm(`Delete Assignment ${assignment.number}? Its uploaded PDFs will also be deleted.`)) return; try { await jsonRequest(`/api/assignments/${assignment.id}`, { method: "DELETE" }); setAssignments((items) => items.filter((item) => item.id !== assignment.id)); window.dispatchEvent(new Event("unify-assignments-updated")); } catch (err) { setError(err.message); } };
  const toggleCourse = (courseId) => setExpandedCourses((current) => { const next = new Set(current); if (next.has(courseId)) next.delete(courseId); else next.add(courseId); return next; });
  return <section className="page assignments-page"><PageHeader eyebrow="Academic" title="Assignments" description="Keep every brief, deadline, and finished submission connected to its course." />
    {error && <p className="courses-error">{error}</p>}{loading ? <p>Loading assignments…</p> : groups.map(({ type, courses: typedCourses }) => typedCourses.length > 0 && <section className="assignment-section" key={type}><div className="assignment-section__heading"><div><p className="eyebrow">Current semester</p><h2>{type === "lab" ? "Lab" : "Theory"} courses</h2></div></div><div className="assignment-course-grid">{typedCourses.map((course) => { const items = assignments.filter((item) => item.course.id === course.id); const expanded = expandedCourses.has(course.id); const visibleItems = expanded ? items : items.slice(0, 3); return <article className={`assignment-course-card ${expanded ? "is-expanded" : ""}`} key={course.id}><header><div><p className="eyebrow">{course.code}</p><h3>{course.title}</h3></div><Button onClick={() => setEditing({ course, assignment: null })}><Plus size={15} /> Add</Button></header>{items.length ? <><div className="assignment-list">{visibleItems.map((assignment) => <AssignmentCard key={assignment.id} assignment={assignment} course={course} onEdit={setEditing} onRemove={remove} onUploaded={replace} onError={setError} />)}</div>{items.length > 3 && <button className="assignment-list-toggle" type="button" onClick={() => toggleCourse(course.id)} aria-expanded={expanded}>{expanded ? <><ChevronUp size={16} /> Show less</> : <><ChevronDown size={16} /> Show more ({items.length - 3})</>}</button>}</> : <p className="assignment-course-card__empty">No assignment slots yet. Add one when your faculty announces it.</p>}</article>; })}</div></section>)}
    {!courses.length && <section className="exams-empty"><FileText size={24} /><h2>No classified courses yet</h2><p>Create a current semester and add Theory or Lab courses to start tracking assignments.</p></section>}
    {editing && <AssignmentModal assignment={editing.assignment} course={editing.course} onClose={() => setEditing(null)} onSave={(payload) => save(editing.course, payload, editing.assignment)} />}
  </section>;
}
