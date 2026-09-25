import { useState } from "react";
import { CalendarDays, Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/ui";
import { getRoutineClasses, ROUTINE_DAYS } from "../utils/routine";

export default function RoutinePage() {
  const [classes] = useState(getRoutineClasses);
  return (
    <section className="page routine-page routine-page--wide">
      <PageHeader eyebrow="Academic" title="Routine" description="Keep your class schedule close at hand." />
      <div className="routine-actions routine-actions--single">
        <Link className="routine-action-card" to="/academic/routine/edit"><span className="routine-action-card__icon"><Pencil size={20} /></span><span><strong>Edit current routine</strong><small>Update your weekly classes</small></span></Link>
      </div>
      <section className="routine-board">
        <div className="routine-board__heading"><span className="today-class-card__icon"><CalendarDays size={20} /></span><div><p className="eyebrow">Weekly schedule</p><h2>Your class routine</h2></div></div>
        {classes.length ? <div className="routine-board__days">{ROUTINE_DAYS.map((day) => {
          const dayClasses = classes.filter((course) => course.day === day).sort((a, b) => a.start.localeCompare(b.start));
          return <div className="routine-board__day" key={day}><strong>{day}</strong><div>{dayClasses.length ? dayClasses.map((course) => <article className="routine-board__class" key={course.id}><time>{course.start} – {course.end}</time><h3>{course.title}</h3>{course.faculty && <p>{course.faculty}</p>}</article>) : <span className="routine-board__empty-day">No classes</span>}</div></div>;
        })}</div> : <p className="today-class-card__empty">Your weekly routine is empty. Choose “Edit current routine” to add classes.</p>}
      </section>
    </section>
  );
}
