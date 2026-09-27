import { useEffect, useState } from "react";
import {
  Bookmark,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { PageHeader } from "../components/ui";
import { announcements } from "./campusLifeData";
import { postedTime } from "../utils/postedTime";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const toDateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const announcementDate = (item) => item.publishedOn || item.createdAt?.slice(0, 10) || "";

export default function AnnouncementsPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [saved, setSaved] = useState([]);
  const [bookmarkError, setBookmarkError] = useState("");
  const [announcementItems, setAnnouncementItems] = useState(announcements);
  const [selectedDate, setSelectedDate] = useState("");
  const [query, setQuery] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return undefined;
    let active = true;
    fetch(`${apiUrl}/api/announcements`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Unable to load announcements.");
        if (active) setAnnouncementItems(result.announcements || []);
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return undefined;
    let active = true;
    fetch(`${apiUrl}/api/announcements/bookmarks`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Unable to load bookmarks.");
        if (active) setSaved((result.bookmarks || []).map(String));
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);
  const filters = ["All", "Bookmarked", "Academic", "Campus update", "Opportunity", "Student life"];
  const categoryItems = activeFilter === "All"
    ? announcementItems
    : activeFilter === "Bookmarked"
      ? announcementItems.filter((item) => saved.includes(String(item._id || item.id)))
      : announcementItems.filter((item) => item.category === activeFilter);
  const dateFiltered = selectedDate
    ? categoryItems.filter((item) => announcementDate(item) === selectedDate)
    : categoryItems;
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visible = normalizedQuery
    ? dateFiltered.filter((item) => [item.title, item.copy, item.source, item.category].some((value) => value?.toLocaleLowerCase().includes(normalizedQuery)))
    : dateFiltered;
  const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const leadingDays = (new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay() + 6) % 7;
  const calendarCells = [...Array(leadingDays).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];
  const datesWithAnnouncements = new Set(announcementItems.map(announcementDate).filter(Boolean));
  const toggleSaved = async (id) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    const key = String(id);
    const isSaved = saved.includes(key);
    setBookmarkError("");
    try {
      const response = await fetch(`${apiUrl}/api/announcements/${key}/bookmark`, {
        method: isSaved ? "DELETE" : "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to update bookmark.");
      setSaved((result.bookmarks || []).map(String));
    } catch (error) {
      setBookmarkError(error.message || "Unable to update bookmark.");
    }
  };
  return (
    <section className="page campus-page">
      <PageHeader
        eyebrow="Campus life"
        title="Announcements"
        description="A quiet corner for the updates that shape your week."
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
        {selectedDate && <button className="announcement-date-clear" type="button" onClick={() => setSelectedDate("")}>Clear date filter</button>}
      </div>
      <label className="announcement-search">
        <Search size={18} aria-hidden="true" />
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search announcements" aria-label="Search announcements" />
      </label>
      {bookmarkError && <p className="announcement-bookmark-error" role="alert">{bookmarkError}</p>}
      <div className="announcement-layout">
        <div className="announcement-list">
          {visible.map((item) => (
            <article
              className={`announcement-card announcement-card--${item.tone}`}
              key={item._id || item.id}
            >
              <div className="announcement-card__marker" aria-hidden="true" />
              <div className="announcement-card__body">
                <div className="announcement-card__meta">
                  <span className="tag">{item.category}</span>
                  <span>{postedTime(item)}</span>
                </div>
                <h2>{item.title}</h2>
                <p>{item.copy}</p>
                <span className="announcement-card__source">{item.source}</span>
              </div>
              <button
                type="button"
                className={`save-button ${saved.includes(String(item._id || item.id)) ? "is-saved" : ""}`}
                onClick={() => toggleSaved(item._id || item.id)}
                aria-label={`Save ${item.title}`}
              >
                <Bookmark
                  size={18}
                  fill={saved.includes(String(item._id || item.id)) ? "currentColor" : "none"}
                />
              </button>
            </article>
          ))}
          {!visible.length && (
            <p className="empty-state">
              {activeFilter === "Bookmarked" && !selectedDate ? "You haven’t bookmarked any announcements yet." : selectedDate ? "There are no announcements for this date and filter." : "There are no announcements in this category yet."}
            </p>
          )}
        </div>
        <aside className="announcement-aside">
          <section className="mini-calendar">
            <div className="mini-calendar__heading">
              <button type="button" aria-label="Previous month" onClick={() => setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft size={17} /></button>
              <h2>{calendarMonth.toLocaleString("en-US", { month: "long", year: "numeric" })}</h2>
              <CalendarDays size={18} />
              <button type="button" aria-label="Next month" onClick={() => setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight size={17} /></button>
            </div>
            <div className="calendar-week">
              {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                <span key={`${day}-${index}`}>{day}</span>
              ))}
            </div>
            <div className="calendar-days">
              {calendarCells.map((day, index) => {
                if (!day) return <span className="calendar-day-blank" key={`blank-${index}`} />;
                const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
                const dateKey = toDateKey(date);
                const classes = [
                  dateKey === toDateKey(new Date()) ? "is-today" : "",
                  selectedDate === dateKey ? "is-selected" : "",
                  datesWithAnnouncements.has(dateKey) ? "has-announcements" : "",
                ].filter(Boolean).join(" ");
                return <button type="button" key={dateKey} className={classes} aria-pressed={selectedDate === dateKey} aria-label={`${date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}${datesWithAnnouncements.has(dateKey) ? ", announcements available" : ""}`} onClick={() => setSelectedDate(dateKey)}>{day}</button>;
              })}
            </div>
            <p className="calendar-selection-note">{selectedDate ? `Showing announcements for ${new Date(`${selectedDate}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}` : `${datesWithAnnouncements.size} days with announcements`}</p>
          </section>
        </aside>
      </div>
    </section>
  );
}
