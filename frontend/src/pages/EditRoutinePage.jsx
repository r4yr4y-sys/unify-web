import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../components/ui";
import { getRoutineClasses, ROUTINE_DAYS, saveRoutineClasses } from "../utils/routine";

const emptyClass = (day) => ({
  id: `${Date.now()}-${Math.random()}`,
  day,
  title: "",
  faculty: "",
  start: "",
  end: "",
});

export default function EditRoutinePage() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState(getRoutineClasses);
  const [draft, setDraft] = useState(null);
  const updateDraft = (field, value) => setDraft((current) => ({ ...current, [field]: value }));
  const saveClass = () => {
    if (!draft.title.trim() || !draft.start || !draft.end) return;
    const nextClasses = [...classes, { ...draft, title: draft.title.trim(), faculty: draft.faculty.trim() }];
    setClasses(nextClasses);
    saveRoutineClasses(nextClasses);
    setDraft(null);
  };
  const removeClass = (id) => {
    const nextClasses = classes.filter((course) => course.id !== id);
    setClasses(nextClasses);
    saveRoutineClasses(nextClasses);
  };

  return (
    <section className="page routine-page routine-page--wide">
      <PageHeader eyebrow="Academic" title="Edit routine" description="Add your classes to the day and time they are held." />
      <section className="routine-editor">
        <div className="routine-editor__header"><div><p className="eyebrow">Weekly timetable</p><h2>Plan your classes</h2></div><button type="button" className="routine-editor__done" onClick={() => navigate("/academic/routine")}>Done</button></div>
        {draft && <section className="routine-class-form" aria-label={`Add class on ${draft.day}`}>
          <div className="routine-class-form__heading"><div><p className="eyebrow">New class</p><h3>Add class for {draft.day}</h3></div><button type="button" className="routine-icon-button" onClick={() => setDraft(null)} aria-label="Close class form"><X size={18} /></button></div>
          <div className="routine-class-form__fields">
            <label>Start time<input type="time" value={draft.start} onChange={(event) => updateDraft("start", event.target.value)} /></label>
            <label>End time<input type="time" value={draft.end} onChange={(event) => updateDraft("end", event.target.value)} /></label>
            <label>Course title<input placeholder="e.g. CSE 2201" value={draft.title} onChange={(event) => updateDraft("title", event.target.value)} /></label>
            <label>Faculty name <span>(optional)</span><input placeholder="e.g. Dr. Rahman" value={draft.faculty} onChange={(event) => updateDraft("faculty", event.target.value)} /></label>
            <button type="button" className="routine-add-button" onClick={saveClass} disabled={!draft.title.trim() || !draft.start || !draft.end}>Save class</button>
          </div>
        </section>}
        <div className="routine-edit-grid" role="table" aria-label="Weekly class timetable">
          <div className="routine-edit-grid__corner" role="columnheader">Day</div><div className="routine-edit-grid__heading" role="columnheader">Classes</div>
          {ROUTINE_DAYS.map((day) => {
            const dayClasses = classes.filter((course) => course.day === day).sort((a, b) => a.start.localeCompare(b.start));
            return <div className="routine-edit-grid__row" role="row" key={day}><strong role="rowheader">{day}</strong><div className="routine-edit-grid__classes" role="cell">
              {dayClasses.map((course) => <article className="routine-edit-class" key={course.id}><span>{course.start} – {course.end}</span><strong>{course.title}</strong>{course.faculty && <small>{course.faculty}</small>}<button type="button" onClick={() => removeClass(course.id)} aria-label={`Remove ${course.title}`}><Trash2 size={14} /></button></article>)}
              <button type="button" className="routine-day-add" onClick={() => setDraft(emptyClass(day))} aria-label={`Add class for ${day}`}><Plus size={19} /><span>Add class</span></button>
            </div></div>;
          })}
        </div>
      </section>
    </section>
  );
}
