import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  Megaphone,
  PackageOpen,
  SearchCheck,
  Sparkles,
  Store,
  DoorOpen,
} from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/ui";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function CampusLifePage() {
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [marketListings, setMarketListings] = useState([]);
  const [lostFoundItems, setLostFoundItems] = useState([]);
  const [emptyRoomCount, setEmptyRoomCount] = useState(0);
  const currentDate = new Intl.DateTimeFormat("en-US", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const upcomingEvents = events.filter((event) => !event.date || event.date >= today);
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return undefined;
    let active = true;
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${apiUrl}/api/announcements`, { headers }).then((response) => response.ok ? response.json() : null),
      fetch(`${apiUrl}/api/events`, { headers }).then((response) => response.ok ? response.json() : null),
      fetch(`${apiUrl}/api/marketplace-listings`, { headers }).then((response) => response.ok ? response.json() : null),
      fetch(`${apiUrl}/api/lost-found-items`, { headers }).then((response) => response.ok ? response.json() : null),
      fetch(`${apiUrl}/api/empty-rooms`, { headers }).then((response) => response.ok ? response.json() : null),
    ]).then(([announcementResult, eventResult, marketplaceResult, lostFoundResult, emptyRoomsResult]) => {
      if (!active) return;
      setAnnouncements(announcementResult?.announcements || []);
      setEvents(eventResult?.events || []);
      setMarketListings(marketplaceResult?.listings || []);
      setLostFoundItems(lostFoundResult?.items || []);
      setEmptyRoomCount(emptyRoomsResult?.rooms?.length || 0);
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  const campusSections = [
    {
      title: "Announcements",
      copy: `${announcements.length} announcement${announcements.length === 1 ? "" : "s"}`,
      to: "/campus-life/announcements",
      icon: Megaphone,
      accent: "blue",
      note: announcements[0]?.title || "No announcements yet",
    },
    {
      title: "Events",
      copy: `${upcomingEvents.length} upcoming event${upcomingEvents.length === 1 ? "" : "s"}`,
      to: "/campus-life/events",
      icon: CalendarDays,
      accent: "violet",
      note: upcomingEvents[0]?.title || "No upcoming events",
    },
    {
      title: "Marketplace",
      copy: `${marketListings.length} listing${marketListings.length === 1 ? "" : "s"} from students`,
      to: "/campus-life/marketplace",
      icon: Store,
      accent: "amber",
      note: marketListings[0] ? `${marketListings[0].title} · ${marketListings[0].category}` : "No listings yet",
    },
    {
      title: "Lost & Found",
      copy: `${lostFoundItems.length} item${lostFoundItems.length === 1 ? "" : "s"} reported`,
      to: "/campus-life/lost-found",
      icon: SearchCheck,
      accent: "green",
      note: lostFoundItems[0] ? `${lostFoundItems[0].status}: ${lostFoundItems[0].title}` : "No reports yet",
    },
    {
      title: "Empty Rooms",
      copy: `${emptyRoomCount} room${emptyRoomCount === 1 ? "" : "s"} listed by admins`,
      to: "/campus-life/empty-rooms",
      icon: DoorOpen,
      accent: "violet",
      note: "Search by day and time",
    },
  ];
  return (
    <section className="page campus-page campus-overview">
      <PageHeader
        eyebrow="Campus life"
        title="Your campus, in one place"
        description="Catch the moments, updates, and small connections that make life beyond class feel more like yours."
      />
      <section className="campus-hero">
        <div>
          <span className="event-hero__eyebrow">
            <Sparkles size={16} /> {currentDate}
          </span>
          <h2>There is more to campus than your timetable.</h2>
          <p>
            Take a minute to see what is happening around you—then step back
            into your day feeling connected.
          </p>
          <Link className="campus-hero__button" to="/campus-life/events">
            See what’s on <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="campus-hero__shapes" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </section>
      <div className="campus-section-heading">
        <div>
          <p className="eyebrow">Explore campus</p>
          <h2>What do you need today?</h2>
        </div>
        <span>Fresh from your community</span>
      </div>
      <div className="campus-section-grid">
        {campusSections.map(({ title, copy, to, icon: Icon, accent, note }) => (
          <Link
            className={`campus-section-card campus-section-card--${accent}`}
            to={to}
            key={to}
          >
            <div className="campus-section-card__top">
              <span className="campus-section-card__icon">
                <Icon size={20} />
              </span>
              <ArrowUpRight size={18} />
            </div>
            <h2>{title}</h2>
            <p>{copy}</p>
            <div className="campus-section-card__note">{note}</div>
          </Link>
        ))}
      </div>
      <div className="campus-lower-grid">
        <section className="campus-activity">
          <div className="campus-section-heading">
            <div>
              <p className="eyebrow">New for you</p>
              <h2>Today on campus</h2>
            </div>
            <Link to="/campus-life/announcements">View all</Link>
          </div>
          <div className="campus-activity__list">
            <Link to="/campus-life/announcements">
              <span className="activity-icon activity-icon--blue">
                <Megaphone size={17} />
              </span>
              <div>
                <strong>{announcements[0]?.title || "No announcements yet"}</strong>
                <p>
                  {announcements[0] ? `${announcements[0].source} · ${announcements[0].time}` : ""}
                </p>
              </div>
              <ArrowUpRight size={16} />
            </Link>
            <Link to="/campus-life/events">
              <span className="activity-icon activity-icon--violet">
                <CalendarDays size={17} />
              </span>
              <div>
                <strong>{upcomingEvents[0]?.title || "No upcoming events"}</strong>
                <p>
                  {upcomingEvents[0] ? `${upcomingEvents[0].time} · ${upcomingEvents[0].place}` : ""}
                </p>
              </div>
              <ArrowUpRight size={16} />
            </Link>
            <Link to="/campus-life/lost-found">
              <span className="activity-icon activity-icon--green">
                <PackageOpen size={17} />
              </span>
              <div>
                <strong>{lostFoundItems[0]?.title || "No lost and found reports yet"}</strong>
                <p>{lostFoundItems[0]?.location || ""}</p>
              </div>
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </section>
        <section className="campus-quick">
          <p className="eyebrow">Small actions, big help</p>
          <h2>Found something on campus?</h2>
          <p>Share a quick report and help get it back to its owner.</p>
          <Link to="/campus-life/lost-found">
            Report an item <ArrowUpRight size={16} />
          </Link>
        </section>
      </div>
    </section>
  );
}
