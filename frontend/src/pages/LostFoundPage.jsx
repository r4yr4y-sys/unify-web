import { useState } from "react";
import {
  Check,
  CheckCircle2,
  MapPin,
  PackageOpen,
  Plus,
  SearchCheck,
  Ticket,
} from "lucide-react";
import { Button, PageHeader } from "../components/ui";
import { foundItems, ItemArtwork } from "./campusLifeData";

export default function LostFoundPage() {
  const [mode, setMode] = useState("All");
  const [claimed, setClaimed] = useState([]);
  const items =
    mode === "All"
      ? foundItems
      : foundItems.filter((item) => item.status === mode);
  const claim = (id) =>
    setClaimed((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
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
