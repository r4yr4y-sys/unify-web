import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Plus,
  Target,
} from "lucide-react";
import { Button, PageHeader } from "../components/ui";
import {
  CreateStudyPlanModal,
  StudyPlanModal,
} from "../components/study/StudyPlanModals";

const STORAGE_KEY = "unify-study-plans";
const starterPlans = [
  {
    id: "starter-midterm",
    subject: "CSE 2201",
    topic: "Midterm preparation",
    createdAt: "2026-08-18T00:00:00.000Z",
    deadline: null,
    checkpoints: Array.from({ length: 20 }, (_, index) => ({
      id: `midterm-${index + 1}`,
      text: `Midterm revision task ${index + 1}`,
      completed: index < 13,
    })),
  },
  {
    id: "starter-calculus",
    subject: "MAT 1203",
    topic: "Calculus revision",
    createdAt: "2026-08-20T00:00:00.000Z",
    deadline: null,
    checkpoints: Array.from({ length: 20 }, (_, index) => ({
      id: `calculus-${index + 1}`,
      text: `Calculus revision task ${index + 1}`,
      completed: index < 7,
    })),
  },
];

function loadPlans() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : starterPlans;
  } catch {
    return starterPlans;
  }
}
function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value.slice(0, 10)}T00:00:00`));
}
function deadlineLabel(deadline) {
  if (!deadline) return null;
  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const days = Math.round(
    (new Date(`${deadline}T00:00:00`) - todayStart) / 86400000,
  );
  if (days === 0) return "Due today";
  if (days > 0) return `${days} day${days === 1 ? "" : "s"} left`;
  const overdue = Math.abs(days);
  return `${overdue} day${overdue === 1 ? "" : "s"} overdue`;
}

function StudyPlanCard({ plan, onOpen }) {
  const completed = plan.checkpoints.filter(
    (checkpoint) => checkpoint.completed,
  ).length;
  const progress = Math.round((completed / plan.checkpoints.length) * 100);
  const deadline = deadlineLabel(plan.deadline);
  return (
    <article
      className={`plan-card study-plan-card ${progress === 100 ? "is-complete" : ""}`}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Open ${plan.topic} study plan`}
    >
      <div className="plan-card__top">
        <span>{plan.subject}</span>
        {progress === 100 && <CheckCircle2 size={17} aria-label="Completed" />}
      </div>
      <h2 title={plan.topic}>{plan.topic}</h2>
      <p>{progress}% Complete</p>
      <div className="plan-progress" aria-label={`${progress}% complete`}>
        <span style={{ width: `${progress}%` }} />
      </div>
      <div className="study-plan-card__details">
        <span>
          {completed} / {plan.checkpoints.length} checkpoints
        </span>
        <span>Created {formatDate(plan.createdAt)}</span>
        {deadline && (
          <span>
            <CalendarDays size={13} /> {deadline}
          </span>
        )}
      </div>
      <footer>
        <span>{progress === 100 ? "Plan completed" : "Open plan"}</span>
        <ArrowUpRight size={16} />
      </footer>
    </article>
  );
}

export default function StudyPlansPage() {
  const [plans, setPlans] = useState(loadPlans);
  const [showCreate, setShowCreate] = useState(false);
  const [activePlanId, setActivePlanId] = useState(null);
  const activePlan = plans.find((plan) => plan.id === activePlanId) || null;
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  }, [plans]);

  function createPlan(values) {
    setPlans((current) => [
      {
        id: `plan-${Date.now()}`,
        ...values,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
    setShowCreate(false);
  }
  function updatePlan(updatedPlan) {
    setPlans((current) =>
      current.map((plan) => (plan.id === updatedPlan.id ? updatedPlan : plan)),
    );
  }
  return (
    <section className="page study-page">
      <PageHeader
        eyebrow="Study"
        title="Study plans"
        description="Turn the semester into smaller, steadier wins."
        actions={
          <Button onClick={() => setShowCreate(true)}>
            <Plus size={17} /> Create plan
          </Button>
        }
      />
      <section className="study-plan-hero">
        <span>
          <Target size={28} />
        </span>
        <div>
          <p className="eyebrow">Keep moving forward</p>
          <h2>Make a plan your future self will thank you for.</h2>
          <p>
            Break down revision into focused sessions and track what is already
            done.
          </p>
        </div>
      </section>
      <div className="plans-grid">
        {plans.map((plan) => (
          <StudyPlanCard
            key={plan.id}
            plan={plan}
            onOpen={() => setActivePlanId(plan.id)}
          />
        ))}
      </div>
      {showCreate && (
        <CreateStudyPlanModal
          onClose={() => setShowCreate(false)}
          onCreate={createPlan}
        />
      )}
      {activePlan && (
        <StudyPlanModal
          plan={activePlan}
          onClose={() => setActivePlanId(null)}
          onUpdate={updatePlan}
        />
      )}
    </section>
  );
}
