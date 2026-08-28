import { useState } from "react";
import { CalendarDays, Pencil, Plus, Upload } from "lucide-react";
import { PageHeader } from "../components/ui";

export default function RoutinePage() {
  const [uploadedFile, setUploadedFile] = useState("");
  const [editing, setEditing] = useState(false);
  const [day, setDay] = useState("Monday");
  const [date, setDate] = useState("");
  const [classes, setClasses] = useState([]);
  const addClass = () => setClasses((current) => [...current, { id: Date.now(), name: "New course", start: "09:00", end: "10:30" }]);
  const updateClass = (id, field, value) => setClasses((current) => current.map((item) => item.id === id ? { ...item, [field]: value } : item));

  return <section className="page routine-page">
    <PageHeader eyebrow="Academic" title="Routine" description="Keep your class schedule close at hand." />
    {!editing && <div className="routine-actions"><label className="routine-action-card"><span className="routine-action-card__icon"><Upload size={21} /></span><span><strong>Upload new routine</strong><small>{uploadedFile || "Add your latest class schedule"}</small></span><input type="file" accept=".pdf,image/*" onChange={(event) => setUploadedFile(event.target.files?.[0]?.name || "")} /></label><button className="routine-action-card" type="button" onClick={() => setEditing(true)}><span className="routine-action-card__icon"><Pencil size={20} /></span><span><strong>Edit current routine</strong><small>Update a class, room, or time</small></span></button></div>}
    {!editing ? <section className="today-class-card"><div className="today-class-card__heading"><span className="today-class-card__icon"><CalendarDays size={20} /></span><div><p className="eyebrow">Today’s class</p><h2>Your schedule is clear</h2></div></div><p className="today-class-card__empty">Upload your routine to see today’s classes here.</p></section> : <section className="routine-editor"><div className="routine-editor__header"><div><p className="eyebrow">Edit current routine</p><h2>Plan your classes</h2></div><button type="button" className="routine-editor__done" onClick={() => setEditing(false)}>Done</button></div><div className="routine-editor__controls"><label>Day<select value={day} onChange={(event) => setDay(event.target.value)}>{["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((item) => <option key={item}>{item}</option>)}</select></label><label>Date<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label><button type="button" className="routine-add-button" onClick={addClass}><Plus size={18} /> Add class</button></div><div className="routine-editor__classes">{classes.map((course) => <article className="routine-course-card" key={course.id}><input aria-label="Course name" value={course.name} onChange={(event) => updateClass(course.id, "name", event.target.value)} /><div><label>Start<input aria-label="Course start time" type="time" value={course.start} onChange={(event) => updateClass(course.id, "start", event.target.value)} /></label><label>End<input aria-label="Course end time" type="time" value={course.end} onChange={(event) => updateClass(course.id, "end", event.target.value)} /></label></div><button type="button" onClick={() => setClasses((current) => current.filter((item) => item.id !== course.id))}>Remove</button></article>)}{!classes.length && <p className="routine-editor__empty">No classes added for {day} yet. Use “Add class” to start your routine.</p>}</div></section>}
  </section>;
}
