import { useState } from "react";
import { ArrowUpRight, Plus, Target } from "lucide-react";
import { Button, PageHeader } from "../components/ui";

export default function StudyPlansPage() {
  const [plans, setPlans] = useState([{ id: 1, title: "Midterm preparation", course: "CSE 2201", progress: 65 }, { id: 2, title: "Calculus revision", course: "MAT 1203", progress: 35 }]);
  return <section className="page study-page">
    <PageHeader eyebrow="Study" title="Study plans" description="Turn the semester into smaller, steadier wins." actions={<Button onClick={() => setPlans((current) => [...current, { id: Date.now(), title: "New study plan", course: "No course", progress: 0 }])}><Plus size={17} /> Create plan</Button>} />
    <section className="study-plan-hero"><span><Target size={28} /></span><div><p className="eyebrow">Keep moving forward</p><h2>Make a plan your future self will thank you for.</h2><p>Break down revision into focused sessions and track what is already done.</p></div></section>
    <div className="plans-grid">{plans.map((plan) => <article className="plan-card" key={plan.id}><div className="plan-card__top"><span>{plan.course}</span><button type="button" onClick={() => setPlans((current) => current.map((item) => item.id === plan.id ? { ...item, progress: Math.min(item.progress + 10, 100) } : item))}>+10%</button></div><h2>{plan.title}</h2><p>{plan.progress}% complete</p><div className="plan-progress"><span style={{ width: `${plan.progress}%` }} /></div><footer>{plan.progress === 100 ? "Completed" : "Continue plan"}<ArrowUpRight size={16} /></footer></article>)}</div>
  </section>;
}
