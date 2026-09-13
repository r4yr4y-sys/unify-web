import { useEffect, useState } from "react";
import {
  Check,
  CheckCircle2,
  MapPin,
  PackageOpen,
  Plus,
  SearchCheck,
  Ticket,
  X,
} from "lucide-react";
import { Button, PageHeader } from "../components/ui";
import { ItemArtwork } from "./campusLifeData";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("authToken")}`,
});
const formatDate = (value) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

function ReportItemModal({ onClose, onCreate, saving }) {
  const [values, setValues] = useState({
    status: "Lost",
    title: "",
    location: "",
    description: "",
  });
  const [error, setError] = useState("");
  useEffect(() => {
    const closeOnEscape = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);
  const change = (field) => (event) =>
    setValues((current) => ({ ...current, [field]: event.target.value }));
  function submit(event) {
    event.preventDefault();
    if (!values.title.trim() || !values.location.trim())
      return setError("Enter the item name and where it was lost or found.");
    onCreate({
      ...values,
      title: values.title.trim(),
      location: values.location.trim(),
      description: values.description.trim(),
    });
  }
  return (
    <div className="lost-report-backdrop" role="presentation" onClick={onClose}>
      <section
        className="lost-report-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-item-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="lost-report-modal__close"
          onClick={onClose}
          aria-label="Close report form"
        >
          <X size={18} />
        </button>
        <form onSubmit={submit} className="lost-report-form">
          <header>
            <p className="eyebrow">Lost & found</p>
            <h2 id="report-item-title">Report an item</h2>
            <p>Share enough detail for other students to recognize it.</p>
          </header>
          <label>
            <span>Report type</span>
            <select value={values.status} onChange={change("status")}>
              <option value="Lost">I lost something</option>
              <option value="Found">I found something</option>
            </select>
          </label>
          <label>
            <span>Item name</span>
            <input
              autoFocus
              maxLength="150"
              value={values.title}
              onChange={change("title")}
              placeholder="e.g. Black wireless earbuds"
            />
          </label>
          <label>
            <span>Location</span>
            <input
              maxLength="250"
              value={values.location}
              onChange={change("location")}
              placeholder="e.g. North Library entrance"
            />
          </label>
          <label>
            <span>
              Description <em>Optional</em>
            </span>
            <textarea
              maxLength="1000"
              value={values.description}
              onChange={change("description")}
              placeholder="Colour, brand, identifying features, or when you last saw it"
              rows="4"
            />
          </label>
          {error && (
            <p className="lost-report-form__error" role="alert">
              {error}
            </p>
          )}
          <footer>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Posting…" : "Post report"}
            </Button>
          </footer>
        </form>
      </section>
    </div>
  );
}

export default function LostFoundPage() {
  const [mode, setMode] = useState("All"),
    [items, setItems] = useState([]),
    [claimed, setClaimed] = useState([]),
    [showReport, setShowReport] = useState(false),
    [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    fetch(`${apiUrl}/api/lost-found-items`, { headers: authHeaders() })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok)
          throw new Error(
            result.message || "Unable to load lost and found reports.",
          );
        return result.items;
      })
      .then((savedItems) => {
        if (active) setItems(savedItems);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  async function createItem(values) {
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`${apiUrl}/api/lost-found-items`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Unable to post your item report.");
      setItems((current) => [result.item, ...current]);
      setShowReport(false);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }
  const visibleItems =
      mode === "All" ? items : items.filter((item) => item.status === mode),
    lostCount = items.filter((item) => item.status === "Lost").length,
    foundCount = items.filter((item) => item.status === "Found").length;
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
          <Button onClick={() => setShowReport(true)}>
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
      </section>
      <div className="lost-summary">
        <div>
          <span className="lost-summary__icon">
            <PackageOpen size={19} />
          </span>
          <strong>{items.length}</strong>
          <p>items reported</p>
        </div>
        <div>
          <span className="lost-summary__icon lost-summary__icon--green">
            <CheckCircle2 size={19} />
          </span>
          <strong>{foundCount}</strong>
          <p>items found</p>
        </div>
        <div>
          <span className="lost-summary__icon lost-summary__icon--amber">
            <Ticket size={19} />
          </span>
          <strong>{lostCount}</strong>
          <p>items lost</p>
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
      </div>
      {error && (
        <p className="lost-page-error" role="alert">
          {error}
        </p>
      )}
      {loading ? (
        <p className="lost-page-empty">Loading item reports…</p>
      ) : visibleItems.length === 0 ? (
        <p className="lost-page-empty">
          No {mode === "All" ? "" : mode.toLowerCase()} item reports yet. Be the
          first to post one.
        </p>
      ) : (
        <div className="lost-items">
          {visibleItems.map((item) => (
            <article className="lost-item" key={item.id}>
              <ItemArtwork
                label={item.status === "Lost" ? "LOST" : "FOUND"}
                hue={item.status === "Lost" ? "amber" : "green"}
              />
              <div className="lost-item__content">
                <div className="lost-item__top">
                  <span
                    className={`status status--${item.status.toLowerCase()}`}
                  >
                    {item.status}
                  </span>
                  <span>{formatDate(item.createdAt)}</span>
                </div>
                <h2>{item.title}</h2>
                <p>
                  <MapPin size={15} /> {item.location}
                </p>
                {item.description && (
                  <p className="lost-item__description">{item.description}</p>
                )}
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
      )}
      {showReport && (
        <ReportItemModal
          onClose={() => setShowReport(false)}
          onCreate={createItem}
          saving={saving}
        />
      )}
    </section>
  );
}
