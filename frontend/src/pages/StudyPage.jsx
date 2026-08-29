import {
  ArrowUpRight,
  Clock3,
  FileText,
  FolderOpen,
  Target,
} from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/ui";

export default function StudyPage() {
  const sections = [
    {
      title: "Notes",
      copy: "Capture and revisit your lecture notes.",
      stat: "3 notes",
      to: "/study/notes",
      icon: FileText,
      hue: "blue",
    },
    {
      title: "Resources",
      copy: "Keep files and helpful links together.",
      stat: "3 resources",
      to: "/study/resources",
      icon: FolderOpen,
      hue: "violet",
    },
    {
      title: "Study plans",
      copy: "Build a clear path through revision.",
      stat: "2 active plans",
      to: "/study/plans",
      icon: Target,
      hue: "amber",
    },
    {
      title: "Study Timer",
      copy: "Set a duration or stay in the zone as long as you need.",
      stat: "Start session",
      to: "/study/timer",
      icon: Clock3,
      hue: "green",
    },
  ];

  return (
    <section className="page study-page study-overview">
      <PageHeader
        eyebrow="Study"
        title="Your study space"
        description="A focused home for your notes, resources, and plans—so every study session starts with clarity."
      />
      <section className="study-overview__hero">
        <div>
          <p className="eyebrow">Keep your momentum</p>
          <h2>Everything for your next good study session.</h2>
          <p>
            Pick up where you left off, save what matters, and make steady
            progress toward your goals.
          </p>
        </div>
        <span aria-hidden="true">
          <Target size={34} />
        </span>
      </section>
      <div className="study-overview__heading">
        <div>
          <p className="eyebrow">Your tools</p>
          <h2>What would you like to work on?</h2>
        </div>
        <span>All your study essentials, one place.</span>
      </div>
      <div className="study-overview__grid">
        {sections.map(({ title, copy, stat, to, icon: Icon, hue }) => (
          <Link
            className={`study-summary-card study-summary-card--${hue}`}
            to={to}
            key={to}
          >
            <div>
              <span className="study-summary-card__icon">
                <Icon size={21} />
              </span>
              <ArrowUpRight size={18} />
            </div>
            <h2>{title}</h2>
            <p>{copy}</p>
            <footer>
              {stat}
              <span>Open</span>
            </footer>
          </Link>
        ))}
      </div>
    </section>
  );
}
