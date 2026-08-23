import { useNavigate } from "react-router-dom";
import { PageHeader } from "../components/ui";
import StudyTimer from "../components/study/StudyTimer";

export default function StudyTimerPage() {
  const navigate = useNavigate();

  return (
    <section className="page study-page study-timer-page">
      <PageHeader
        eyebrow="Study"
        title="Study Timer"
        description="Start a focused session with a countdown or an open-ended study flow."
      />
      <StudyTimer onExit={() => navigate("/study")} />
    </section>
  );
}
