import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BellRing,
  Bookmark,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Check,
  Filter,
  Heart,
  MapPin,
  Megaphone,
  PackageOpen,
  Plus,
  SearchCheck,
  Search,
  SlidersHorizontal,
  Sparkles,
  Store,
  Ticket,
  WalletCards,
  Users,
} from "lucide-react";
import { Button, PageHeader, SectionCard } from "../components/ui";

const makePage = (title, description) =>
  function Page() {
    return (
      <section className="page">
        <PageHeader
          eyebrow="Unify workspace"
          title={title}
          description={description}
        />
        <SectionCard title="Coming soon">
          <p className="empty-state">
            This section is ready for its feature-specific experience.
          </p>
        </SectionCard>
      </section>
    );
  };
export const DashboardPage = makePage(
  "Dashboard",
  "A central overview of your university life will appear here.",
);
export const AcademicPage = makePage(
  "Academic",
  "Manage your courses, assignments, grades, and exams in one place.",
);
export const SettingsPage = makePage(
  "Settings",
  "Customize your Unify workspace preferences.",
);

const announcements = [
  {
    id: 1,
    category: "Academic",
    tone: "blue",
    title: "Midterm Examination Schedule",
    copy: "Exam dates, times, rooms, and instructions for students.",
    source: "Office of the Registrar",
    time: "2 hours ago",
    important: true,
  },
  {
    id: 2,
    category: "Campus update",
    tone: "violet",
    title: "New Club Formation",
    copy: "AUST recently announced the formation of the AUST Model United Nations Cell and AUST Cybersecurity and AI Club",
    source: "University Library",
    time: "Yesterday",
  },
  {
    id: 3,
    category: "Opportunity",
    tone: "amber",
    title: "Research Grant Opportunity",
    copy: "Call for students to submit research proposals through the AUST Student Research Grant.",
    source: "Research & Innovation",
    time: "Dec 4",
  },
  {
    id: 4,
    category: "Student life",
    tone: "green",
    title: "Club Recruitment",
    copy: "Recruitment for AUST Model United Nations Cell.",
    source: "Student Affairs",
    time: "Dec 2",
  },
];

const events = [
  {
    id: 1,
    month: "DEC",
    date: "12",
    title: "AUST Career Fair",
    time: "10:00 AM â€“ 4:00 PM",
    place: "AUST Auditorium",
    attendees: 84,
    category: "Career",
    color: "violet",
  },
  {
    id: 2,
    month: "DEC",
    date: "14",
    title: "CSE Carnival 6.0",
    time: "6:30 PM â€“ 8:00 PM",
    place: "AUST Multipurpose Hall",
    attendees: 32,
    category: "Workshop",
    color: "blue",
  },
  {
    id: 3,
    month: "DEC",
    date: "18",
    title: "AUST Inter-Department Sports Festival",
    time: "3:00 PM â€“ 6:00 PM",
    place: "AUST Sports Ground",
    attendees: 57,
    category: "Sports",
    color: "orange",
  },
  {
    id: 4,
    month: "JAN",
    date: "08",
    title: "Blood Donation & Social Welfare Program",
    time: "5:30 PM â€“ 7:30 PM",
    place: "AUST Campus Courtyard",
    attendees: 118,
    category: "Community",
    color: "pink",
  },
];

const marketplaceItems = [
  {
    id: 1,
    title: "Calculus: Early Transcendentals",
    price: "à§³2400",
    detail: "Like new Â· 9th edition",
    category: "Books",
    seller: "Adnan",
    hue: "blue",
    icon: "BOOK",
  },
  {
    id: 2,
    title: "Scientific calculator",
    price: "à§³1800",
    detail: "Casio fx-991EX Â· Excellent",
    category: "Academic",
    seller: "Nowfel",
    hue: "violet",
    icon: "fx",
  },
  {
    id: 3,
    title: "Desk lamp",
    price: "à§³1200",
    detail: "Warm light Â· Adjustable arm",
    category: "Home",
    seller: "Jayed",
    hue: "amber",
    icon: "LAMP",
  },
  {
    id: 4,
    title: "Campus hoodie",
    price: "à§³1600",
    detail: "Medium Â· Worn twice",
    category: "Fashion",
    seller: "Imran",
    hue: "pink",
    icon: "UNI",
  },
  {
    id: 5,
    title: "USB-C hub",
    price: "à§³1500",
    detail: "HDMI + USB 3.0 ports",
    category: "Tech",
    seller: "Tahsin",
    hue: "green",
    icon: "USB",
  },
  {
    id: 6,
    title: "Biology lab coat",
    price: "à§³900",
    detail: "Size S Â· Freshly cleaned",
    category: "Academic",
    seller: "Rafi",
    hue: "orange",
    icon: "LAB",
  },
];

const foundItems = [
  {
    id: 1,
    status: "Found",
    title: "Black wireless earbuds",
    area: "Found near the North Library entrance",
    date: "Today, 11:40 AM",
    hue: "violet",
    icon: "â—–â——",
  },
  {
    id: 2,
    status: "Lost",
    title: "Silver water bottle",
    area: "Last seen in room 7A03",
    date: "Yesterday",
    hue: "blue",
    icon: "Hâ‚‚O",
  },
  {
    id: 3,
    status: "Found",
    title: "Student ID card",
    area: "Handed in at the Student Commons desk",
    date: "Dec 8",
    hue: "green",
    icon: "ID",
  },
  {
    id: 4,
    status: "Lost",
    title: "Grey knit scarf",
    area: "Last seen around the Arts courtyard",
    date: "Dec 7",
    hue: "amber",
    icon: "~",
  },
];

export function CampusLifePage() {
  const campusSections = [
    {
      title: "Announcements",
      copy: "2 new updates for your week",
      to: "/campus-life/announcements",
      icon: Megaphone,
      accent: "blue",
      note: announcements[0].title,
    },
    {
      title: "Events",
      copy: "4 things happening soon",
      to: "/campus-life/events",
      icon: CalendarDays,
      accent: "violet",
      note: events[0].title,
    },
    {
      title: "Marketplace",
      copy: "146 listings from students",
      to: "/campus-life/marketplace",
      icon: Store,
      accent: "amber",
      note: `${marketplaceItems[0].title} Â· ${marketplaceItems[0].price}`,
    },
    {
      title: "Lost & Found",
      copy: "4 items need attention",
      to: "/campus-life/lost-found",
      icon: SearchCheck,
      accent: "green",
      note: foundItems[0].title,
    },
  ];
  return (
    <section className="page campus-page campus-overview">
      <PageHeader
        eyebrow="Campus life"
        title="Your campus, in one place"
        description="Catch the moments, updates, and small connections that make life beyond class feel more like yours."
        actions={
          <Button variant="secondary">
            <BellRing size={17} /> 2 new updates
          </Button>
        }
      />
      <section className="campus-hero">
        <div>
          <span className="event-hero__eyebrow">
            <Sparkles size={16} /> Friday, 12 December
          </span>
          <h2>There is more to campus than your timetable.</h2>
          <p>
            Take a minute to see what is happening around youâ€”then step back
            into your day feeling connected.
          </p>
          <Link className="campus-hero__button" to="/campus-life/events">
            See whatâ€™s on <ArrowUpRight size={16} />
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
                <strong>{announcements[0].title}</strong>
                <p>
                  {announcements[0].source} Â· {announcements[0].time}
                </p>
              </div>
              <ArrowUpRight size={16} />
            </Link>
            <Link to="/campus-life/events">
              <span className="activity-icon activity-icon--violet">
                <CalendarDays size={17} />
              </span>
              <div>
                <strong>{events[0].title}</strong>
                <p>
                  {events[0].time} Â· {events[0].place}
                </p>
              </div>
              <ArrowUpRight size={16} />
            </Link>
            <Link to="/campus-life/lost-found">
              <span className="activity-icon activity-icon--green">
                <PackageOpen size={17} />
              </span>
              <div>
                <strong>{foundItems[0].title}</strong>
                <p>{foundItems[0].area}</p>
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

export function AnnouncementsPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [saved, setSaved] = useState([]);
  const filters = ["All", "Academic", "Campus update", "Opportunity"];
  const visible =
    activeFilter === "All"
      ? announcements
      : announcements.filter((item) => item.category === activeFilter);

  function toggleSaved(id) {
    setSaved((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

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

export function EventsPage() {
  const [selected, setSelected] = useState([]);
  const [query, setQuery] = useState("");
  const visibleEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(query.toLowerCase()) ||
      event.category.toLowerCase().includes(query.toLowerCase()),
  );
  function toggleEvent(id) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }
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

function ItemArtwork({ label, hue }) {
  return (
    <div className={`item-artwork item-artwork--${hue}`} aria-hidden="true">
      <span>{label}</span>
    </div>
  );
}

export function MarketplacePage() {
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState([]);
  const items = marketplaceItems.filter((item) =>
    `${item.title} ${item.category}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  function toggleSaved(id) {
    setSaved((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }
  return (
    <section className="page campus-page">
      <PageHeader
        eyebrow="Campus life"
        title="Student marketplace"
        description="Pass on what you no longer need and find what makes student life easier."
        actions={
          <Button>
            <Plus size={17} /> Post a listing
          </Button>
        }
      />
      <section className="marketplace-intro">
        <div className="marketplace-intro__icon">
          <WalletCards size={29} />
        </div>
        <div>
          <span className="event-hero__eyebrow">
            Buy local, keep it circular
          </span>
          <h2>Good things deserve a second semester.</h2>
          <p>Browse trusted listings from students on your campus.</p>
        </div>
        <div className="marketplace-intro__stats">
          <strong>146</strong>
          <span>active listings</span>
        </div>
      </section>
      <div className="marketplace-controls">
        <label className="event-search">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search books, tech, furnitureâ€¦"
          />
        </label>
        <div className="filter-pills marketplace-pills">
          {["All items", "Books", "Tech", "Under 2000"].map((item, index) => (
            <button
              className={`filter-pill ${index === 0 ? "is-active" : ""}`}
              type="button"
              key={item}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="marketplace-grid">
        {items.map((item) => (
          <article className="market-item" key={item.id}>
            <ItemArtwork label={item.icon} hue={item.hue} />
            <button
              type="button"
              className={`market-save ${saved.includes(item.id) ? "is-saved" : ""}`}
              onClick={() => toggleSaved(item.id)}
              aria-label={`Save ${item.title}`}
            >
              <Heart
                size={17}
                fill={saved.includes(item.id) ? "currentColor" : "none"}
              />
            </button>
            <div className="market-item__body">
              <span className="tag">{item.category}</span>
              <h2>{item.title}</h2>
              <p>{item.detail}</p>
              <div>
                <strong>{item.price}</strong>
                <span>by {item.seller}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
      {!items.length && (
        <div className="no-results">
          No listings match that search. Try a different keyword.
        </div>
      )}
    </section>
  );
}

export function LostFoundPage() {
  const [mode, setMode] = useState("All");
  const [claimed, setClaimed] = useState([]);
  const items =
    mode === "All"
      ? foundItems
      : foundItems.filter((item) => item.status === mode);
  function claim(id) {
    setClaimed((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }
  return (
    <section className="page campus-page">
      <PageHeader
        eyebrow="Campus life"
        title="Lost & found"
        description="A little help to reconnect students with the things they care about."
        actions={
          <Button>
            <Plus size={17} /> Report an item
          </Button>
        }
      />
      <section className="lost-hero">
        <div className="lost-hero__icon">
          <SearchCheck size={30} />
        </div>
        <div>
          <h2>Something missing? Someone may have found it.</h2>
          <p>
            Browse recent reports, or share the details of an item you found.
          </p>
        </div>
        <button type="button" className="lost-hero__link">
          How it works <span>â†’</span>
        </button>
      </section>
      <div className="lost-summary">
        <div>
          <span className="lost-summary__icon">
            <PackageOpen size={19} />
          </span>
          <strong>18</strong>
          <p>items reported this week</p>
        </div>
        <div>
          <span className="lost-summary__icon lost-summary__icon--green">
            <CheckCircle2 size={19} />
          </span>
          <strong>7</strong>
          <p>items returned to owners</p>
        </div>
        <div>
          <span className="lost-summary__icon lost-summary__icon--amber">
            <Ticket size={19} />
          </span>
          <strong>4</strong>
          <p>awaiting a claim</p>
        </div>
      </div>
      <div className="campus-toolbar">
        <div className="filter-pills">
          {["All", "Lost", "Found"].map((filter) => (
            <button
              className={`filter-pill ${mode === filter ? "is-active" : ""}`}
              type="button"
              key={filter}
              onClick={() => setMode(filter)}
            >
              {filter} items
            </button>
          ))}
        </div>
        <button className="filter-control" type="button">
          <MapPin size={17} /> All locations
        </button>
      </div>
      <div className="lost-items">
        {items.map((item) => (
          <article className="lost-item" key={item.id}>
            <ItemArtwork label={item.icon} hue={item.hue} />
            <div className="lost-item__content">
              <div className="lost-item__top">
                <span className={`status status--${item.status.toLowerCase()}`}>
                  {item.status}
                </span>
                <span>{item.date}</span>
              </div>
              <h2>{item.title}</h2>
              <p>
                <MapPin size={15} /> {item.area}
              </p>
            </div>
            <button
              type="button"
              className={
                claimed.includes(item.id)
                  ? "claim-button is-claimed"
                  : "claim-button"
              }
              onClick={() => claim(item.id)}
            >
              {claimed.includes(item.id) ? (
                <>
                  <Check size={16} /> Contact sent
                </>
              ) : item.status === "Found" ? (
                "This is mine"
              ) : (
                "I found it"
              )}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
