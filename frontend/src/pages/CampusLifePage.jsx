import {
  ArrowUpRight,
  BellRing,
  CalendarDays,
  Megaphone,
  PackageOpen,
  SearchCheck,
  Sparkles,
  Store,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button, PageHeader } from "../components/ui";
import {
  announcements,
  events,
  foundItems,
  marketplaceItems,
} from "./campusLifeData";

export default function CampusLifePage() {
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
