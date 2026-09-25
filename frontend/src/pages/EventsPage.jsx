import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Search,
  Users,
} from "lucide-react";
import { Button, PageHeader } from "../components/ui";
import { events } from "./campusLifeData";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

const interestStorageKey = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return `unify-interested-events:${user.id || "account"}`;
  } catch {
    return "unify-interested-events:account";
  }
};

const eventDateLabel = (event) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(event.date || "")) return `${event.month} ${event.day || event.date}`;
  return new Date(`${event.date}T12:00:00`).toLocaleDateString(undefined, {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
};

export default function EventsPage() {
  const currentDate = new Date();
  const [selected, setSelected] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(interestStorageKey()) || "[]").map(String);
    } catch {
      return [];
    }
  });
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [eventItems, setEventItems] = useState(events);
  const [calendarOpen, setCalendarOpen] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return undefined;
    let active = true;
    fetch(`${apiUrl}/api/events`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Unable to load events.");
        if (active) setEventItems(result.events || []);
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);
  const normalizedQuery = query.trim().toLowerCase();
  const visibleEvents = eventItems.filter((event) =>
    (selectedCategory === "All" || event.category === selectedCategory) &&
    (!normalizedQuery || [event.title, event.category, event.place, event.time].some((value) => value?.toLowerCase().includes(normalizedQuery))),
  );
  const toggleEvent = (id) => {
    const key = String(id);
    setSelected((current) => {
      const next = current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key];
      localStorage.setItem(interestStorageKey(), JSON.stringify(next));
      window.dispatchEvent(new Event("unify-interested-events-updated"));
      return next;
    });
  };
  const interestedEvents = selected
    .map((id) => eventItems.find((event) => String(event._id || event.id) === id))
    .filter(Boolean)
    .sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  return (
    <section className="page campus-page">
      <PageHeader
        eyebrow="Campus life"
        title="Events around campus"
        description="Find something worth stepping away from your desk for."
        actions={
          <div className="my-calendar">
          <Button aria-expanded={calendarOpen} aria-controls="my-calendar-list" onClick={() => setCalendarOpen((open) => !open)}>
            <CalendarDays size={17} /> My calendar{" "}
            {interestedEvents.length ? `(${interestedEvents.length})` : ""}
          </Button>
          {calendarOpen && <div className="my-calendar__popover" id="my-calendar-list">
            <h2>My calendar</h2>
            {interestedEvents.length ? interestedEvents.map((event) => <article key={event._id || event.id} className="my-calendar__event">
              <div><strong>{event.title}</strong><span>{eventDateLabel(event)} · {event.time}</span></div>
              <button type="button" aria-label={`Remove ${event.title} from My calendar`} onClick={() => toggleEvent(event._id || event.id)}>Remove</button>
            </article>) : <p className="my-calendar__empty">You haven’t selected any events yet. Choose “I’m interested” on an event to add it here.</p>}
          </div>}
          </div>
        }
      />
      <div className="event-hero">
        <div>
          <h2>Meet, make, and find your people.</h2>
          <p>
            From career opportunities to late-afternoon games, there is a little
            more campus waiting for you.
          </p>
        </div>
        <div className="event-hero__date">
          <span>{currentDate.toLocaleDateString(undefined, { weekday: "long" }).toUpperCase()}</span>
          <strong>{currentDate.getDate()}</strong>
          <small>{currentDate.toLocaleDateString(undefined, { month: "long" })}</small>
        </div>
      </div>
      <div className="campus-toolbar">
        <div className="filter-pills" role="group" aria-label="Event categories">
          {["All", "Career", "Workshop", "Sports", "Community"].map((category) => (
            <button type="button" key={category} className={`filter-pill ${selectedCategory === category ? "is-active" : ""}`} aria-pressed={selectedCategory === category} onClick={() => setSelectedCategory(category)}>
              {category === "All" ? "All categories" : category}
            </button>
          ))}
        </div>
      </div>
      <label className="announcement-search">
          <Search size={18} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search events"
            aria-label="Search events"
          />
      </label>
      <div className="events-grid">
        {visibleEvents.map((event) => (
          <article className="event-card" key={event._id || event.id}>
            <div className={`event-date event-date--${event.color}`}>
              <span>{event.month}</span>
              <strong>{event.day || event.date}</strong>
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
                    selected.includes(String(event._id || event.id))
                      ? "event-rsvp is-going"
                      : "event-rsvp"
                  }
                  onClick={() => toggleEvent(event._id || event.id)}
                >
                  {selected.includes(String(event._id || event.id)) ? (
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
        {eventItems.length ? "No events match that search. Try another keyword." : "There are no upcoming events right now."}
        </div>
      )}
    </section>
  );
}
