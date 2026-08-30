import { useEffect, useState } from "react";
import { CalendarDays, Check, Plus, Trash2, X } from "lucide-react";
import { Button } from "../ui";

function formatDate(value) {
  if (!value) return "";
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function newCheckpoint() {
  return { id: `checkpoint-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, text: "", completed: false };
}

function Modal({ children, onClose, label }) {
  useEffect(() => {
    const closeOnEscape = (event) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);
  return <div className="study-plan-modal-backdrop" role="presentation" onClick={onClose}><section className="study-plan-modal" role="dialog" aria-modal="true" aria-label={label} onClick={(event) => event.stopPropagation()}><button type="button" className="study-plan-modal__close" onClick={onClose} aria-label="Close"><X size={18} /></button>{children}</section></div>;
}

export function CreateStudyPlanModal({ onClose, onCreate }) {
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [deadline, setDeadline] = useState("");
  const [checkpoints, setCheckpoints] = useState([newCheckpoint()]);
  const [error, setError] = useState("");
  function submit(event) {
    event.preventDefault();
    const valid = checkpoints.filter((item) => item.text.trim());
    if (!subject.trim() || !topic.trim() || !valid.length) return setError("Add a subject, topic, and at least one checkpoint.");
    onCreate({ subject: subject.trim(), topic: topic.trim(), deadline: deadline || null, checkpoints: valid.map((item) => ({ ...item, text: item.text.trim() })) });
  }
  return <Modal onClose={onClose} label="Create study plan"><form className="study-plan-form" onSubmit={submit}><header className="study-plan-modal__header"><p className="eyebrow">Study plans</p><h2>Create study plan</h2><p>Turn a larger topic into clear, manageable checkpoints.</p></header><div className="study-plan-form__fields"><label><span>Subject</span><input autoFocus value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="e.g. Data Structures" /></label><label><span>Topic</span><input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="e.g. Graph Algorithms" /></label><label><span>Deadline <em>Optional</em></span><input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} /></label></div><section className="study-plan-checkpoints"><div className="study-plan-checkpoints__heading"><div><h3>Checkpoints</h3><p>Add at least one step to track your progress.</p></div></div><div className="study-plan-checkpoints__list">{checkpoints.map((checkpoint, index) => <div className="study-plan-checkpoint-input" key={checkpoint.id}><span>{index + 1}</span><input value={checkpoint.text} onChange={(event) => setCheckpoints((current) => current.map((item) => item.id === checkpoint.id ? { ...item, text: event.target.value } : item))} placeholder="e.g. Learn BFS" aria-label={`Checkpoint ${index + 1}`} /><button type="button" onClick={() => setCheckpoints((current) => current.filter((item) => item.id !== checkpoint.id))} disabled={checkpoints.length === 1} aria-label={`Remove checkpoint ${index + 1}`}><Trash2 size={16} /></button></div>)}</div><button type="button" className="study-plan-add-checkpoint" onClick={() => setCheckpoints((current) => [...current, newCheckpoint()])}><Plus size={16} /> Add checkpoint</button></section>{error && <p className="study-plan-form__error">{error}</p>}<footer className="study-plan-modal__footer"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit">Create plan</Button></footer></form></Modal>;
}

export function StudyPlanModal({ plan, onClose, onUpdate }) {
  const [newText, setNewText] = useState("");
  const completed = plan.checkpoints.filter((item) => item.completed).length;
  const progress = Math.round((completed / plan.checkpoints.length) * 100);
  const update = (checkpoints) => onUpdate({ ...plan, checkpoints });
  function addCheckpoint(event) { event.preventDefault(); if (!newText.trim()) return; update([...plan.checkpoints, { ...newCheckpoint(), text: newText.trim() }]); setNewText(""); }
  return <Modal onClose={onClose} label={`${plan.subject}: ${plan.topic}`}><header className="study-plan-modal__header study-plan-modal__header--detail"><p className="eyebrow">{plan.subject}</p><h2>{plan.topic}</h2><div className="study-plan-meta"><span>Created {formatDate(plan.createdAt)}</span>{plan.deadline && <span><CalendarDays size={14} /> Deadline {formatDate(plan.deadline)}</span>}</div></header><section className="study-plan-detail-progress"><div><strong>{progress}% Complete</strong><span>{completed} / {plan.checkpoints.length} checkpoints</span></div><div className="plan-progress" aria-label={`${progress}% complete`}><span style={{ width: `${progress}%` }} /></div></section><section className="study-plan-detail-checkpoints"><h3>Checkpoints</h3><div className="study-plan-detail-checkpoints__list">{plan.checkpoints.map((checkpoint) => <label className={`study-plan-detail-checkpoint ${checkpoint.completed ? "is-complete" : ""}`} key={checkpoint.id}><input type="checkbox" checked={checkpoint.completed} onChange={() => update(plan.checkpoints.map((item) => item.id === checkpoint.id ? { ...item, completed: !item.completed } : item))} /><span className="study-plan-detail-checkpoint__box"><Check size={14} /></span><span>{checkpoint.text}</span><button type="button" onClick={(event) => { event.preventDefault(); update(plan.checkpoints.filter((item) => item.id !== checkpoint.id)); }} disabled={plan.checkpoints.length === 1} aria-label={`Remove ${checkpoint.text}`}><Trash2 size={16} /></button></label>)}</div><form className="study-plan-add-inline" onSubmit={addCheckpoint}><input value={newText} onChange={(event) => setNewText(event.target.value)} placeholder="Add a new checkpoint" aria-label="New checkpoint" /><Button type="submit" variant="secondary" disabled={!newText.trim()}><Plus size={16} /> Add</Button></form></section><footer className="study-plan-modal__footer"><Button type="button" variant="secondary" onClick={onClose}>Close</Button></footer></Modal>;
}
