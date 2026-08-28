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
  Droplets,
  GraduationCap,
  Music2,
  Phone,
  School,
  UserRound,
} from "lucide-react";
import { Button, PageHeader, SectionCard } from "../components/ui";
import { BentoCard, BentoGrid } from "../components/ui";
import profilePicture from "../assets/Profile_pic.jpg";

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
const profileDetails = [
  ["Student ID", "CSE-22-041"],
  ["Department", "Computer Science & Engineering"],
  ["Program", "B.Sc. in Engineering"],
  ["Semester", "4th Semester"],
  ["Batch", "2022–2026"],
  ["University Email", "jayed.raihan@unify.edu"],
];
const personalDetails = [
  ["Phone Number", "+880 1712 345 678", Phone],
  ["Date of Birth", "14 February 2003", CalendarDays],
  ["Gender", "Male", UserRound],
  ["Blood Group", "O+", Droplets],
  ["Address", "Dhanmondi, Dhaka", MapPin],
];
const emergencyContacts = [
  ["B.M. Adnan Saleh", "Father", "+880 1812 987 654"],
  ["Khalif, Farhana Saleh", "Mother", "+880 1712 345 678"],
];
const socialLinks = [
  ["GitHub", "https://github.com/jayedraihan", "https://img.icons8.com/?size=48&id=12599&format=png"],
  ["Instagram", "https://www.instagram.com/", "https://img.icons8.com/?size=48&id=32292&format=png"],
  ["LinkedIn", "https://www.linkedin.com/", "https://img.icons8.com/?size=48&id=13930&format=png"],
  ["Facebook", "https://www.facebook.com/", "https://img.icons8.com/?size=48&id=118497&format=png"],
];
function ProfileInfoList({ items, withIcons = false }) {
  return (
    <dl className="profile-info-list">
      {items.map(([label, value, Icon]) => (
        <div className="profile-info-list__item" key={label}>
          {withIcons && Icon && <Icon size={16} aria-hidden="true" />}
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
const profileInlineStyles = `
.profile-grid { grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 18px; }
.profile-page { font-family: "Plus Jakarta Sans", "DM Sans", sans-serif; }
.profile-grid > * { min-width: 0; }
.profile-hero { grid-column: span 7; min-height: 265px; overflow: hidden; }
.profile-hero__identity { display: flex; align-items: center; gap: 22px; }
.profile-hero__identity img { width: 112px; height: 112px; flex: 0 0 112px; border: 5px solid #fff; border-radius: 50%; object-fit: cover; }
.profile-panel--basic { grid-column: span 5; }
.profile-panel--personal { grid-column: span 5; }
.profile-panel--journey { grid-column: span 7; }
.profile-panel--emergency { grid-column: 1 / -1; }
.profile-listen { grid-column: span 3; display: flex; min-height: 148px; color: inherit; text-decoration: none; border: 1px solid rgba(255, 255, 255, 0.75); border-radius: 20px; background: #f9faff; box-shadow: 8px 8px 20px rgba(164, 175, 201, 0.18), -6px -6px 16px rgba(255, 255, 255, 0.92); transition: transform 0.22s ease, box-shadow 0.22s ease; }
.profile-listen:hover { transform: translateY(-4px); box-shadow: 10px 12px 22px rgba(164, 175, 201, 0.22), -6px -6px 16px rgba(255, 255, 255, 0.95); }
.profile-panel--personal .profile-info-list { gap: 8px; }
.profile-panel--personal .profile-info-list__item { padding: 9px 10px; border: 1px solid #edf0f6; border-radius: 11px; background: rgba(255, 255, 255, 0.48); }
.profile-emergency-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.profile-emergency-contacts { display: grid; gap: 14px; }
.profile-emergency-grid > div { display: grid; gap: 5px; padding: 10px 12px; border-left: 2px solid #f0c9ca; }
.profile-emergency-grid dt { color: #929bad; font-size: 0.68rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
.profile-emergency-grid dd { margin: 0; color: #35415e; font-size: 0.84rem; font-weight: 700; }
.profile-connect { grid-column: span 9; min-height: 148px; }
.profile-social-links { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
.profile-social-links img { width: 20px; height: 20px; flex: 0 0 20px; object-fit: contain; display: block; }
@media (max-width: 900px) { .profile-hero { grid-column: 1 / -1; } .profile-panel--basic, .profile-panel--personal, .profile-panel--journey { grid-column: span 6; } .profile-listen { grid-column: span 4; } .profile-connect { grid-column: span 8; } }
@media (max-width: 680px) { .profile-grid { grid-template-columns: 1fr; } .profile-hero, .profile-panel--basic, .profile-panel--personal, .profile-panel--journey, .profile-panel--emergency, .profile-listen, .profile-connect { grid-column: 1 / -1; } .profile-hero__identity img { width: 88px; height: 88px; flex-basis: 88px; } .profile-social-links, .profile-emergency-grid { grid-template-columns: 1fr; } }
`;
export function ProfilePage() {
  return (
    <section className="page profile-page">
      <style>{profileInlineStyles}</style>
      <PageHeader
        eyebrow="Student identity"
        title="Profile"
        description="A quick view of your university life, journey, and the things that make you you."
      />
      <BentoGrid className="profile-grid">
        <BentoCard className="profile-hero">
          <div className="profile-hero__identity">
            <img src={profilePicture} alt="Jayed Raihan" />
            <div>
              <p className="eyebrow">Student profile</p>
              <h2>Jayed Raihan</h2>
              <p>Computer Science &amp; Engineering</p>
              <span>4th Semester</span>
            </div>
          </div>
          <p className="profile-hero__bio">“Building things, breaking things, and learning along the way.”</p>
          <div className="profile-hero__tag"><span /> Open to new ideas</div>
        </BentoCard>

        <BentoCard className="profile-panel profile-panel--basic">
          <div className="profile-card-heading"><span className="profile-card-heading__icon"><School size={18} /></span><div><p className="eyebrow">The essentials</p><h2>Basic information</h2></div></div>
          <ProfileInfoList items={profileDetails} />
        </BentoCard>

        <BentoCard className="profile-panel profile-panel--personal">
          <div className="profile-card-heading"><span className="profile-card-heading__icon profile-card-heading__icon--mint"><UserRound size={18} /></span><div><p className="eyebrow">A little more</p><h2>Personal information</h2></div></div>
          <ProfileInfoList items={personalDetails} withIcons />
        </BentoCard>

        <BentoCard className="profile-panel profile-panel--journey">
          <div className="profile-card-heading"><span className="profile-card-heading__icon profile-card-heading__icon--gold"><GraduationCap size={18} /></span><div><p className="eyebrow">The road so far</p><h2>Academic journey</h2></div></div>
          <div className="profile-timeline">
            <div><span className="profile-timeline__dot" /><div><strong>School</strong><p>Dhaka Residential Model College</p><small>2010 – 2019</small></div></div>
            <div><span className="profile-timeline__dot" /><div><strong>College</strong><p>Notre Dame College, Dhaka</p><small>2019 – 2021</small></div></div>
            <div><span className="profile-timeline__dot profile-timeline__dot--current" /><div><strong>University</strong><p>AUST University</p><small>2022 – Present</small></div></div>
          </div>
        </BentoCard>

        <BentoCard className="profile-panel profile-panel--emergency">
          <div className="profile-card-heading"><span className="profile-card-heading__icon profile-card-heading__icon--coral"><Phone size={18} /></span><div><p className="eyebrow">There when it matters</p><h2>Emergency contact</h2></div></div>
          <div className="profile-emergency-contacts">
            {emergencyContacts.map(([name, relationship, phone]) => (
              <dl className="profile-emergency-grid" key={name}>
                <div><dt>Name</dt><dd>{name}</dd></div>
                <div><dt>Relationship</dt><dd>{relationship}</dd></div>
                <div><dt>Phone Number</dt><dd>{phone}</dd></div>
              </dl>
            ))}
          </div>
        </BentoCard>

        <a className="profile-listen" href="https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M" target="_blank" rel="noreferrer">
          <span className="profile-listen__icon"><Music2 size={23} /></span>
          <div><p className="eyebrow">A little soundtrack</p><h2>Listen With Me</h2><p>What I’m listening to lately <span aria-hidden="true">→</span></p></div>
        </a>

        <BentoCard className="profile-connect">
          <div className="profile-card-heading"><span className="profile-card-heading__icon profile-card-heading__icon--blue"><span aria-hidden="true">↗</span></span><div><p className="eyebrow">Find me around</p><h2>Connect</h2></div></div>
          <div className="profile-social-links">{socialLinks.map(([label, href, iconUrl]) => <a href={href} key={label} target="_blank" rel="noreferrer"><img src={iconUrl} alt="" /><span>{label}</span><span aria-hidden="true">↗</span></a>)}</div>
        </BentoCard>
      </BentoGrid>
    </section>
  );
}
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
    time: "10:00 AM – 4:00 PM",
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
    time: "6:30 PM – 8:00 PM",
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
    time: "3:00 PM – 6:00 PM",
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
    time: "5:30 PM – 7:30 PM",
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
    price: "৳2400",
    detail: "Like new · 9th edition",
    category: "Books",
    seller: "Adnan",
    hue: "blue",
    icon: "BOOK",
  },
  {
    id: 2,
    title: "Scientific calculator",
    price: "৳1800",
    detail: "Casio fx-991EX · Excellent",
    category: "Academic",
    seller: "Nowfel",
    hue: "violet",
    icon: "fx",
  },
  {
    id: 3,
    title: "Desk lamp",
    price: "৳1200",
    detail: "Warm light · Adjustable arm",
    category: "Home",
    seller: "Jayed",
    hue: "amber",
    icon: "LAMP",
  },
  {
    id: 4,
    title: "Campus hoodie",
    price: "৳1600",
    detail: "Medium · Worn twice",
    category: "Fashion",
    seller: "Imran",
    hue: "pink",
    icon: "UNI",
  },
  {
    id: 5,
    title: "USB-C hub",
    price: "৳1500",
    detail: "HDMI + USB 3.0 ports",
    category: "Tech",
    seller: "Tahsin",
    hue: "green",
    icon: "USB",
  },
  {
    id: 6,
    title: "Biology lab coat",
    price: "৳900",
    detail: "Size S · Freshly cleaned",
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
    icon: "◖◗",
  },
  {
    id: 2,
    status: "Lost",
    title: "Silver water bottle",
    area: "Last seen in room 7A03",
    date: "Yesterday",
    hue: "blue",
    icon: "H₂O",
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
      note: `${marketplaceItems[0].title} · ${marketplaceItems[0].price}`,
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
                <strong>{announcements[0].title}</strong>
                <p>
                  {announcements[0].source} · {announcements[0].time}
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
                  {events[0].time} · {events[0].place}
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
            placeholder="Search books, tech, furniture…"
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
          How it works <span>→</span>
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
