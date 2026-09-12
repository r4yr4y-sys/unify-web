import { useEffect, useState } from "react";
import { Download, FileText, FolderOpen, Plus, Search, Trash2, Upload } from "lucide-react";
import { PageHeader } from "../components/ui";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const hues = ["blue", "violet", "amber", "green"];
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
});
const formatDate = (value) => new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));

export default function NotesPage() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch(`${apiUrl}/api/notes`, { headers: authHeaders() })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Unable to load notes.");
        return result.notes;
      })
      .then((notes) => active && setItems(notes))
      .catch((requestError) => active && setError(requestError.message))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const uploadNote = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.type !== "application/pdf" || !/\.pdf$/i.test(file.name)) {
      setError("Please choose a PDF file.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`${apiUrl}/api/notes`, { method: "POST", headers: authHeaders(), body: formData });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to upload the PDF.");
      setItems((current) => [result.note, ...current]);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setUploading(false);
    }
  };

  const downloadNote = async (note) => {
    setError("");
    try {
      const response = await fetch(`${apiUrl}/api/notes/${note.id}/download`, { headers: authHeaders() });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Unable to download the PDF.");
      }
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = note.originalName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const deleteNote = async (note) => {
    if (!window.confirm(`Delete ${note.originalName}? This cannot be undone.`)) return;
    setDeletingId(note.id);
    setError("");
    try {
      const response = await fetch(`${apiUrl}/api/notes/${note.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Unable to delete the PDF.");
      }
      setItems((current) => current.filter((item) => item.id !== note.id));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setDeletingId("");
    }
  };
  const visible = items.filter((note) =>
    `${note.title} ${note.originalName}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <section className="page study-page">
      <PageHeader
        eyebrow="Study"
        title="Notes"
        description="Keep every lecture thought, formula, and revision note in one calm place."
        actions={
          <label className="button button--primary resource-upload">
            {uploading ? <Upload size={17} /> : <Plus size={17} />}
            {uploading ? "Uploading…" : "Upload PDF"}
            <input type="file" accept="application/pdf,.pdf" onChange={uploadNote} disabled={uploading} />
          </label>
        }
      />
      <div className="study-toolbar">
        <label className="event-search">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search your notes"
          />
        </label>
        <button className="filter-control" type="button">
          <FolderOpen size={17} /> All PDFs
        </button>
      </div>
      {error && <p className="notes-message notes-message--error">{error}</p>}
      {loading ? <p className="study-empty">Loading your PDFs…</p> : <div className="notes-grid">
        {visible.map((note, index) => (
          <article className={`note-card note-card--${hues[index % hues.length]}`} key={note.id}>
            <span className="note-card__icon">
              <FileText size={20} />
            </span>
            <p>PDF note</p>
            <h2 title={note.originalName}>{note.title}</h2>
            <footer>
              <span>{formatDate(note.createdAt)}</span>
              <span className="note-card__actions">
                <button type="button" aria-label={`Download ${note.title}`} title="Download PDF" onClick={() => downloadNote(note)}>
                  <Download size={17} />
                </button>
                <button type="button" className="note-card__delete" aria-label={`Delete ${note.title}`} title="Delete PDF" onClick={() => deleteNote(note)} disabled={deletingId === note.id}>
                  <Trash2 size={16} />
                </button>
              </span>
            </footer>
          </article>
        ))}
      </div>}
      {!loading && !visible.length && (
        <p className="study-empty">No PDFs match that search.</p>
      )}
    </section>
  );
}
