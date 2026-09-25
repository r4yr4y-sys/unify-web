import { useEffect, useState } from "react";
import { ArrowDownToLine, ArrowUpRight, FolderOpen, Link2, Plus, Search, Trash2, Upload, X } from "lucide-react";
import { PageHeader } from "../components/ui";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("authToken") || ""}` });
const hues = { PDF: "blue", DOCX: "violet", PPT: "amber", PPTX: "amber", LINK: "green" };

export default function ResourcesPage() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resourceType, setResourceType] = useState("file");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch(`${apiUrl}/api/resources`, { headers: authHeaders() })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Unable to load resources.");
        if (active) setItems(result.resources || []);
      })
      .catch((requestError) => active && setError(requestError.message))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const submitResource = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    let body;
    let headers = authHeaders();
    if (resourceType === "link") {
      body = JSON.stringify({
        type: "LINK",
        title: formData.get("title"),
        url: formData.get("url"),
        course: formData.get("course"),
        detail: formData.get("detail"),
      });
      headers = { ...headers, "Content-Type": "application/json" };
    } else {
      body = formData;
    }
    try {
      const response = await fetch(`${apiUrl}/api/resources`, { method: "POST", headers, body });
      const result = response.status === 204 ? {} : await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to save this resource.");
      setItems((current) => [result.resource, ...current]);
      form.reset();
      setDialogOpen(false);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteResource = async (resource) => {
    if (!window.confirm(`Remove ${resource.title} from your resources?`)) return;
    setDeletingId(resource.id);
    setError("");
    try {
      const response = await fetch(`${apiUrl}/api/resources/${resource.id}`, { method: "DELETE", headers: authHeaders() });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Unable to remove this resource.");
      }
      setItems((current) => current.filter((item) => item.id !== resource.id));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setDeletingId("");
    }
  };

  const downloadResource = async (resource) => {
    setError("");
    try {
      const response = await fetch(`${apiUrl}/api/resources/${resource.id}/download`, { headers: authHeaders() });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Unable to download this document.");
      }
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = resource.originalName || resource.title;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleItems = normalizedQuery
    ? items.filter((resource) => [resource.title, resource.course, resource.type, resource.detail, resource.originalName].some((value) => value?.toLocaleLowerCase().includes(normalizedQuery)))
    : items;

  return (
    <section className="page study-page">
      <PageHeader
        eyebrow="Study"
        title="Study resources"
        description="Collect useful documents, presentations, and links for your courses."
        actions={<button className="button button--primary" type="button" onClick={() => { setError(""); setDialogOpen(true); }}><Plus size={17} /> Add resource</button>}
      />
      <section className="resource-feature">
        <span><FolderOpen size={26} /></span>
        <div>
          <p className="eyebrow">Your library</p>
          <h2>Everything you need for your next study session.</h2>
          <p>Upload lecture files or save useful links, then keep them organized by course.</p>
        </div>
        <strong>{items.length}<small>resources</small></strong>
      </section>
      <label className="announcement-search">
        <Search size={18} aria-hidden="true" />
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search resources" aria-label="Search resources" />
      </label>
      {error && <p className="notes-message notes-message--error" role="alert">{error}</p>}
      {loading ? <p className="study-empty">Loading your resources…</p> : visibleItems.length ? (
        <div className="resource-list">
          {visibleItems.map((resource) => (
            <article className="resource-item" key={resource.id}>
              <span className={`resource-item__icon resource-item__icon--${hues[resource.type] || "blue"}`}>{resource.type}</span>
              <div>
                <p>{resource.course || "Unsorted"}</p>
                <h2>{resource.title}</h2>
                <small>{resource.detail || resource.originalName || (resource.type === "LINK" ? "External learning resource" : "Uploaded file")}</small>
              </div>
              <span className="resource-item__actions">
                {resource.type === "LINK" ? <a href={resource.url} target="_blank" rel="noreferrer" aria-label={`Open ${resource.title}`} title="Open link"><ArrowUpRight size={18} /></a> : <button type="button" aria-label={`Download ${resource.title}`} title="Download document" onClick={() => downloadResource(resource)}><ArrowDownToLine size={16} /></button>}
                <button type="button" aria-label={`Remove ${resource.title}`} title="Remove resource" onClick={() => deleteResource(resource)} disabled={deletingId === resource.id}><Trash2 size={16} /></button>
              </span>
            </article>
          ))}
        </div>
      ) : <p className="study-empty">{items.length ? "No resources match that search." : "There are no resources yet."}</p>}

      {dialogOpen && (
        <div className="resource-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setDialogOpen(false); }}>
          <section className="resource-dialog" role="dialog" aria-modal="true" aria-labelledby="resource-dialog-title">
            <header><div><p className="eyebrow">Your library</p><h2 id="resource-dialog-title">Add a resource</h2></div><button type="button" aria-label="Close" onClick={() => setDialogOpen(false)} disabled={saving}><X size={19} /></button></header>
            <div className="resource-dialog__type" role="group" aria-label="Resource type">
              <button type="button" className={resourceType === "file" ? "is-active" : ""} onClick={() => setResourceType("file")}><Upload size={16} /> Upload a file</button>
              <button type="button" className={resourceType === "link" ? "is-active" : ""} onClick={() => setResourceType("link")}><Link2 size={16} /> Add a link</button>
            </div>
            {error && <p className="notes-message notes-message--error" role="alert">{error}</p>}
            <form onSubmit={submitResource} className="resource-dialog__form">
              {resourceType === "link" ? <>
                <label>Title<input name="title" maxLength="180" placeholder="e.g. MIT OpenCourseWare" required /></label>
                <label>URL<input name="url" type="url" placeholder="https://example.com" required /></label>
              </> : <>
                <label>Document<input name="file" type="file" accept=".pdf,.docx,.ppt,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation" required /></label>
                <label>Title <span>(optional)</span><input name="title" maxLength="180" placeholder="Use the file name" /></label>
              </>}
              <label>Course<input name="course" maxLength="80" placeholder="e.g. CSE 2207" /></label>
              <label>Note <span>(optional)</span><input name="detail" maxLength="300" placeholder="What is this resource useful for?" /></label>
              <div className="resource-dialog__footer"><button type="button" className="button button--secondary" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</button><button type="submit" className="button button--primary" disabled={saving}>{saving ? "Saving…" : resourceType === "link" ? "Save link" : "Upload file"}</button></div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
