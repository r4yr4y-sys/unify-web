import { useState } from "react";
import {
  BellRing,
  Bookmark,
  CalendarDays,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { Button, PageHeader } from "../components/ui";
import { announcements } from "./campusLifeData";

export default function AnnouncementsPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [saved, setSaved] = useState([]);
  const filters = ["All", "Academic", "Campus update", "Opportunity"];
  const visible =
    activeFilter === "All"
      ? announcements
      : announcements.filter((item) => item.category === activeFilter);
  const toggleSaved = (id) =>
    setSaved((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  return (
    <section className="page campus-page">
      <PageHeader
        eyebrow="Campus life"
        title="Announcements"
        description="A quiet corner for the updates that shape your week."
        actions={
          <Button variant="secondary">
            <BellRing size={17} /> Manage alerts
          </Button>
        }
      />
      <div className="campus-toolbar">
        <div className="filter-pills" aria-label="Announcement categories">
          {filters.map((filter) => (
            <button
              type="button"
              key={filter}
              className={`filter-pill ${activeFilter === filter ? "is-active" : ""}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
        <button className="filter-control" type="button">
          <SlidersHorizontal size={17} /> Filter
        </button>
      </div>
      <div className="announcement-layout">
        <div className="announcement-list">
          {visible.map((item) => (
            <article
              className={`announcement-card announcement-card--${item.tone}`}
              key={item.id}
            >
              <div className="announcement-card__marker" aria-hidden="true" />
              <div className="announcement-card__body">
                <div className="announcement-card__meta">
                  <span className="tag">{item.category}</span>
                  <span>{item.time}</span>
                </div>
                <h2>{item.title}</h2>
                <p>{item.copy}</p>
                <span className="announcement-card__source">{item.source}</span>
              </div>
              <button
                type="button"
                className={`save-button ${saved.includes(item.id) ? "is-saved" : ""}`}
                onClick={() => toggleSaved(item.id)}
                aria-label={`Save ${item.title}`}
              >
                <Bookmark
                  size={18}
                  fill={saved.includes(item.id) ? "currentColor" : "none"}
                />
              </button>
            </article>
          ))}
        </div>
        <aside className="announcement-aside">
          <section className="notice-card">
            <div className="notice-card__icon">
              <Sparkles size={19} />
            </div>
            <p className="eyebrow">Stay in the loop</p>
            <h2>Make campus updates work for you.</h2>
            <p>
              Choose the notices you want to receive and keep your feed focused.
            </p>
            <Button>Update preferences</Button>
          </section>
          <section className="mini-calendar">
            <div className="mini-calendar__heading">
              <h2>December</h2>
              <CalendarDays size={18} />
            </div>
            <div className="calendar-week">
              {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                <span key={`${day}-${index}`}>{day}</span>
              ))}
            </div>
            <div className="calendar-days">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((day) => (
                <span key={day} className={day === 12 ? "is-today" : ""}>
                  {day}
                </span>
              ))}
            </div>
            <p>
              <span className="calendar-dot" /> 3 campus events this week
            </p>
          </section>
        </aside>
      </div>
    </section>
  );
}
