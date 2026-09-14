import { useState } from "react";
import { X } from "lucide-react";
import { assessmentLabel } from "../../utils/assessments";
import { Button } from "../ui";

export default function AssessmentDateModal({ course, onClose, onSave }) {
  const assessments = (course.assessments || []).filter((item) => item.type !== "assignment");
  const [assessmentId, setAssessmentId] = useState(assessments[0]?.id || "");
  const assessment = assessments.find((item) => item.id === assessmentId);
  const [date, setDate] = useState(assessment?.date || "");
  const [time, setTime] = useState(assessment?.time || "");
  const choose = (id) => {
    const next = assessments.find((item) => item.id === id);
    setAssessmentId(id);
    setDate(next?.date || "");
    setTime(next?.time || "");
  };
  const submit = (event) => {
    event.preventDefault();
    if (assessment) onSave(assessment, { date: date || null, time: time || null });
  };
  return <div className="assessment-modal-backdrop"><form className="assessment-modal" onSubmit={submit}>
    <button className="courses-close" type="button" onClick={onClose} aria-label="Close schedule dialog"><X size={18} /></button>
    <p className="eyebrow">{course.code} · {course.title}</p><h2>Schedule assessment</h2>
    <div className="assessment-modal__choices" role="radiogroup" aria-label="Assessment to schedule">{assessments.map((item) => <label key={item.id}><input type="radio" name="assessment" value={item.id} checked={assessmentId === item.id} onChange={() => choose(item.id)} />{assessmentLabel(item, course.courseType)}</label>)}</div>
    <label>Date<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
    <label>Time <span>(optional)</span><input type="time" value={time} onChange={(event) => setTime(event.target.value)} /></label>
    <footer><Button type="button" variant="secondary" onClick={() => { setDate(""); setTime(""); }}>Clear</Button><Button type="submit" disabled={!assessment}>Save schedule</Button></footer>
  </form></div>;
}
