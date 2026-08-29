import { useState } from "react";
import { Heart, Plus, Search, WalletCards } from "lucide-react";
import { Button, PageHeader } from "../components/ui";
import { ItemArtwork, marketplaceItems } from "./campusLifeData";

export default function MarketplacePage() {
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState([]);
  const items = marketplaceItems.filter((item) =>
    `${item.title} ${item.category}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
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
