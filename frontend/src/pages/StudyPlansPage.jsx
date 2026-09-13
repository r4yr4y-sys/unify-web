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

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("authToken")}`,
});
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
  const [plans, setPlans] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [activePlanId, setActivePlanId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const activePlan = plans.find((plan) => plan.id === activePlanId) || null;
  useEffect(() => {
    let active = true;
    fetch(`${apiUrl}/api/study-plans`, { headers: authHeaders() })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok)
          throw new Error(result.message || "Unable to load study plans.");
        return result.plans;
      })
      .then((savedPlans) => {
        if (active) setPlans(savedPlans);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function createPlan(values) {
    setError("");
    try {
      const response = await fetch(`${apiUrl}/api/study-plans`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Unable to create study plan.");
      setPlans((current) => [result.plan, ...current]);
      setShowCreate(false);
    } catch (requestError) {
      setError(requestError.message);
    }
  }
  async function updatePlan(updatedPlan) {
    setError("");
    try {
      const response = await fetch(
        `${apiUrl}/api/study-plans/${updatedPlan.id}`,
        {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify(updatedPlan),
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Unable to save study plan.");
      setPlans((current) =>
        current.map((plan) =>
          plan.id === result.plan.id ? result.plan : plan,
        ),
      );
    } catch (requestError) {
      setError(requestError.message);
    }
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
      {error && (
        <p className="grades-card__empty" role="alert">
          {error}
        </p>
      )}
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
      {loading ? (
        <p>Loading study plans…</p>
      ) : (
        <div className="plans-grid">
          {plans.map((plan) => (
            <StudyPlanCard
              key={plan.id}
              plan={plan}
              onOpen={() => setActivePlanId(plan.id)}
            />
          ))}
        </div>
      )}
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
