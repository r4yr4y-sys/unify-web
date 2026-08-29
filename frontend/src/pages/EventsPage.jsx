import { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Filter,
  MapPin,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { Button, PageHeader } from "../components/ui";
import { events } from "./campusLifeData";

export default function EventsPage() {
  const [selected, setSelected] = useState([]);
  const [query, setQuery] = useState("");
  const visibleEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(query.toLowerCase()) ||
      event.category.toLowerCase().includes(query.toLowerCase()),
  );
  const toggleEvent = (id) =>
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  return (
    <section className="page campus-page">
      <PageHeader
        eyebrow="Campus life"
        title="Events around campus"
        description="Find something worth stepping away from your desk for."
        actions={
          <Button>
            <CalendarDays size={17} /> My calendar{" "}
            {selected.length ? `(${selected.length})` : ""}
          </Button>
        }
      />
      <div className="event-hero">
        <div>
          <span className="event-hero__eyebrow">
            <Sparkles size={16} /> Happening this week
          </span>
          <h2>Meet, make, and find your people.</h2>
          <p>
            From career opportunities to late-afternoon games, there is a little
            more campus waiting for you.
          </p>
          <Button variant="secondary">Explore this week</Button>
        </div>
        <div className="event-hero__date">
          <span>FRIDAY</span>
          <strong>12</strong>
          <small>December</small>
        </div>
      </div>
      <div className="events-controls">
        <label className="event-search">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search events"
          />
        </label>
        <button className="filter-control" type="button">
          <Filter size={17} /> All categories
        </button>
      </div>
      <div className="events-grid">
        {visibleEvents.map((event) => (
          <article className="event-card" key={event.id}>
            <div className={`event-date event-date--${event.color}`}>
              <span>{event.month}</span>
              <strong>{event.date}</strong>
            </div>
            <div className="event-card__content">
              <span className="tag">{event.category}</span>
              <h2>{event.title}</h2>
              <p>
                <Clock3 size={15} /> {event.time}
              </p>
              <p>
                <MapPin size={15} /> {event.place}
              </p>
              <div className="event-card__footer">
                <span>
                  <Users size={15} /> {event.attendees} going
                </span>
                <button
                  type="button"
                  className={
                    selected.includes(event.id)
                      ? "event-rsvp is-going"
                      : "event-rsvp"
                  }
                  onClick={() => toggleEvent(event.id)}
                >
                  {selected.includes(event.id) ? (
                    <>
                      <CheckCircle2 size={16} /> Going
                    </>
                  ) : (
                    "I'm interested"
                  )}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {!visibleEvents.length && (
        <div className="no-results">
          No events match that search. Try another keyword.
        </div>
      )}
    </section>
  );
}
