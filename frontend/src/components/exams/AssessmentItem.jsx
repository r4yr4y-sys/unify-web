import { CalendarDays, Check } from "lucide-react";
import { assessmentLabel, formatSchedule, isUpcoming } from "../../utils/assessments";

export default function AssessmentItem({ course, assessment, onToggle }) {
  const completed = assessment.status === "completed";
  const upcoming = !completed && isUpcoming(assessment.date);
  return (
    <article className={`assessment-item ${completed ? "is-completed" : ""} ${upcoming ? "is-upcoming" : ""}`}>
      <button
        className="assessment-item__check"
        type="button"
        aria-label={`Mark ${assessmentLabel(assessment, course.courseType)} ${completed ? "incomplete" : "complete"}`}
        aria-pressed={completed}
        onClick={(event) => { event.stopPropagation(); onToggle(course, assessment); }}
      >
        {completed && <Check size={14} />}
      </button>
      <div className="assessment-item__details">
        <strong>{assessmentLabel(assessment, course.courseType)}</strong>
        <span>{formatSchedule(assessment)}</span>
      </div>
      <CalendarDays className="assessment-item__calendar" size={16} aria-hidden="true" />
    </article>
  );
}
