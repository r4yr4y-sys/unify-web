import { useEffect, useState } from "react";
import { Check, CheckCircle2, MapPin, PackageOpen, Pencil, Plus, Search, SearchCheck, Ticket, Trash2, X } from "lucide-react";
import { Button, PageHeader } from "../components/ui";
import { ItemArtwork } from "./campusLifeData";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("authToken")}` });
const formatDate = (value) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));

function ReportItemModal({ item, onClose, onSave, saving }) {
  const [values, setValues] = useState(() => item ? { status: item.status, title: item.title, location: item.location, description: item.description || "", contactEmail: item.contactEmail, contactPhone: item.contactPhone, images: [] } : { status: "Lost", title: "", location: "", description: "", contactEmail: "", contactPhone: "", images: [] });
  const [error, setError] = useState("");
  useEffect(() => { const closeOnEscape = (event) => event.key === "Escape" && onClose(); window.addEventListener("keydown", closeOnEscape); return () => window.removeEventListener("keydown", closeOnEscape); }, [onClose]);
  const change = (field) => (event) => { setError(""); setValues((current) => ({ ...current, [field]: event.target.value })); };
  const submit = (event) => {
    event.preventDefault();
    if (!values.title.trim() || !values.location.trim()) return setError("Item name and location are required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contactEmail.trim())) return setError("Enter a valid email address.");
    onSave(Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim ? value.trim() : value])));
  };
  return <div className="lost-report-backdrop" role="presentation" onClick={onClose}><section className="lost-report-modal" role="dialog" aria-modal="true" aria-labelledby="report-item-title" onClick={(event) => event.stopPropagation()}>
    <button type="button" className="lost-report-modal__close" onClick={onClose} aria-label="Close report form"><X size={18} /></button>
    <form noValidate onSubmit={submit} className="lost-report-form"><header><p className="eyebrow">Lost & found</p><h2 id="report-item-title">{item ? "Edit report" : "Report an item"}</h2><p>Share enough detail for other students to recognize and contact you about the item.</p></header>
      <label><span>Report type</span><select value={values.status} onChange={change("status")}><option value="Lost">I lost something</option><option value="Found">I found something</option></select></label>
      <label><span>Item name</span><input autoFocus maxLength="150" value={values.title} onChange={change("title")} placeholder="e.g. Black wireless earbuds" /></label>
      <label><span>Location</span><input maxLength="250" value={values.location} onChange={change("location")} placeholder="e.g. North Library entrance" /></label>
      <div className="lost-report-form__contact"><label><span>Email address</span><input type="email" maxLength="254" value={values.contactEmail} onChange={change("contactEmail")} placeholder="you@example.com" /></label><label><span>Mobile number <em>Optional</em></span><input type="tel" maxLength="30" value={values.contactPhone} onChange={change("contactPhone")} placeholder="e.g. 01XXXXXXXXX" /></label></div>
      <label><span>Item images <em>Optional</em></span><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => setValues((current) => ({ ...current, images: Array.from(event.target.files || []) }))} /><small className="lost-report-form__hint">{values.images.length ? `${values.images.length} image${values.images.length === 1 ? "" : "s"} selected` : item?.images?.length || item?.imageUrl ? "Leave empty to keep the current images" : "Up to 5 JPEG, PNG, or WebP images, 5 MB each"}</small></label>
      <label><span>Description <em>Optional</em></span><textarea maxLength="1000" value={values.description} onChange={change("description")} placeholder="Colour, brand, identifying features, or when you last saw it" rows="4" /></label>
      {error && <p className="lost-report-form__error" role="alert">{error}</p>}<footer><Button type="button" variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Saving…" : item ? "Save changes" : "Post report"}</Button></footer>
    </form></section></div>;
}

export default function LostFoundPage() {
  const [mode, setMode] = useState("All"), [query, setQuery] = useState(""), [items, setItems] = useState([]), [contactDetails, setContactDetails] = useState({}), [editingItem, setEditingItem] = useState(null), [galleryItem, setGalleryItem] = useState(null), [galleryIndex, setGalleryIndex] = useState(0), [showReport, setShowReport] = useState(false), [loading, setLoading] = useState(true), [saving, setSaving] = useState(false), [error, setError] = useState("");
  useEffect(() => { let active = true; fetch(`${apiUrl}/api/lost-found-items`, { headers: authHeaders() }).then(async (response) => { const result = await response.json(); if (!response.ok) throw new Error(result.message || "Unable to load lost and found reports."); return result.items; }).then((savedItems) => active && setItems(savedItems)).catch((requestError) => active && setError(requestError.message)).finally(() => active && setLoading(false)); return () => { active = false; }; }, []);
  async function saveItem(values) {
    setSaving(true); setError("");
    try { const isEditing = Boolean(editingItem); const formData = new FormData(); Object.entries(values).forEach(([key, value]) => { if (key === "images") value.forEach((image) => formData.append("images", image)); else if (value !== null && value !== "") formData.append(key, value); }); const response = await fetch(`${apiUrl}/api/lost-found-items${isEditing ? `/${editingItem.id}` : ""}`, { method: isEditing ? "PUT" : "POST", headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }, body: formData }); const result = await response.json(); if (!response.ok) throw new Error(result.message || "Unable to save your item report."); setItems((current) => isEditing ? current.map((item) => item.id === result.item.id ? result.item : item) : [result.item, ...current]); setShowReport(false); setEditingItem(null); } catch (requestError) { setError(requestError.message); } finally { setSaving(false); }
  }
  async function deleteItem(item) {
    if (!window.confirm(`Delete the report for “${item.title}”?`)) return;
    setError("");
    try { const response = await fetch(`${apiUrl}/api/lost-found-items/${item.id}`, { method: "DELETE", headers: authHeaders() }); if (!response.ok) { const result = await response.json(); throw new Error(result.message || "Unable to delete this report."); } setItems((current) => current.filter((currentItem) => currentItem.id !== item.id)); } catch (requestError) { setError(requestError.message); }
  }
  async function toggleContact(item) {
    if (contactDetails[item.id]) {
      setContactDetails((current) => {
        const { [item.id]: _hidden, ...remaining } = current;
        return remaining;
      });
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/api/lost-found-items/${item.id}/contact`, { headers: authHeaders() });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to load contact details.");
      setContactDetails((current) => ({ ...current, [item.id]: result }));
    } catch (requestError) { setError(requestError.message); }
  }
  const getItemImages = (item) => item.images?.map((image) => image.url).filter(Boolean).length ? item.images.map((image) => image.url).filter(Boolean) : item.imageUrl ? [item.imageUrl] : [];
  const openGallery = (item) => {
    if (!getItemImages(item).length) return;
    setGalleryItem(item);
    setGalleryIndex(0);
  };
  const visibleItems = items.filter((item) => {
    const matchesMode = mode === "All" || (mode === "My listings" ? item.canEdit : item.status === mode);
    const searchText = `${item.title} ${item.location} ${item.description || ""}`.toLowerCase();
    return matchesMode && searchText.includes(query.trim().toLowerCase());
  }), lostCount = items.filter((item) => item.status === "Lost").length, foundCount = items.filter((item) => item.status === "Found").length;
  return <section className="page campus-page"><PageHeader eyebrow="Campus life" title="Lost & found" description="A little help to reconnect students with the things they care about." actions={<Button onClick={() => { setEditingItem(null); setShowReport(true); }}><Plus size={17} /> Report an item</Button>} />
    <section className="lost-hero"><div className="lost-hero__icon"><SearchCheck size={30} /></div><div><h2>Something missing? Someone may have found it.</h2><p>Browse recent reports, or share the details of an item you found.</p></div></section>
    <div className="lost-summary"><div><span className="lost-summary__icon"><PackageOpen size={19} /></span><strong>{items.length}</strong><p>items reported</p></div><div><span className="lost-summary__icon lost-summary__icon--green"><CheckCircle2 size={19} /></span><strong>{foundCount}</strong><p>items found</p></div><div><span className="lost-summary__icon lost-summary__icon--amber"><Ticket size={19} /></span><strong>{lostCount}</strong><p>items lost</p></div></div>
    <div className="campus-toolbar"><div className="filter-pills">{["All", "Lost", "Found", "My listings"].map((filter) => <button className={`filter-pill ${mode === filter ? "is-active" : ""}`} type="button" key={filter} onClick={() => setMode(filter)}>{filter === "My listings" ? filter : `${filter} items`}</button>)}</div></div>
    <label className="announcement-search lost-search"><Search size={18} aria-hidden="true" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search lost and found items" aria-label="Search lost and found items" /></label>
    {error && <p className="lost-page-error" role="alert">{error}</p>}{loading ? <p className="lost-page-empty">Loading item reports…</p> : visibleItems.length === 0 ? <p className="lost-page-empty">{mode === "My listings" ? "You have no item reports yet." : `No matching ${mode === "All" ? "" : mode.toLowerCase()} item reports yet.`}</p> : <div className="lost-items">{visibleItems.map((item) => <article className="lost-item" key={item.id}>{getItemImages(item).length ? <button type="button" className="lost-item__image-button" onClick={() => openGallery(item)}><img className="lost-item__image" src={getItemImages(item)[0]} alt={item.title} />{getItemImages(item).length > 1 && <span>+{getItemImages(item).length - 1}</span>}</button> : <ItemArtwork label={item.status === "Lost" ? "LOST" : "FOUND"} hue={item.status === "Lost" ? "amber" : "green"} />}<div className="lost-item__content" onClick={() => openGallery(item)}><div className="lost-item__top"><span className={`status status--${item.status.toLowerCase()}`}>{item.status}</span><span>{formatDate(item.createdAt)}</span></div><h2>{item.title}</h2><p><MapPin size={15} /> {item.location}</p>{item.description && <p className="lost-item__description">{item.description}</p>}{contactDetails[item.id] && <div className="lost-contact"><strong>Contact the reporter</strong><span>Email: {contactDetails[item.id].contactEmail}</span>{contactDetails[item.id].contactPhone && <span>Phone: {contactDetails[item.id].contactPhone}</span>}</div>}</div>{item.canEdit ? <div className="lost-item__owner-actions"><button type="button" onClick={() => { setEditingItem(item); setShowReport(true); }}><Pencil size={15} /> Edit</button><button type="button" className="is-delete" onClick={() => deleteItem(item)}><Trash2 size={15} /> Delete</button></div> : <button type="button" className={contactDetails[item.id] ? "claim-button is-claimed" : "claim-button"} onClick={() => toggleContact(item)}>{contactDetails[item.id] ? <><Check size={16} /> Contact details shown</> : item.status === "Found" ? "This is mine" : "I found it"}</button>}</article>)}</div>}
    {showReport && <ReportItemModal item={editingItem} onClose={() => { setShowReport(false); setEditingItem(null); }} onSave={saveItem} saving={saving} />}
    {galleryItem && <div className="lost-gallery-backdrop" role="presentation" onClick={() => setGalleryItem(null)}><section className="lost-gallery" role="dialog" aria-modal="true" aria-label={`${galleryItem.title} images`} onClick={(event) => event.stopPropagation()}><button type="button" className="lost-gallery__close" onClick={() => setGalleryItem(null)} aria-label="Close image gallery"><X size={19} /></button><img src={getItemImages(galleryItem)[galleryIndex]} alt={`${galleryItem.title} image ${galleryIndex + 1}`} />{getItemImages(galleryItem).length > 1 && <div className="lost-gallery__thumbnails">{getItemImages(galleryItem).map((url, index) => <button type="button" className={index === galleryIndex ? "is-active" : ""} onClick={() => setGalleryIndex(index)} key={url}><img src={url} alt={`View image ${index + 1}`} /></button>)}</div>}</section></div>}
  </section>;
}
