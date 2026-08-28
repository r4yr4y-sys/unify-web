import { useState } from "react";
import { ArrowUpRight, FileText, FolderOpen, Plus, Search } from "lucide-react";
import { Button, PageHeader } from "../components/ui";

const initialNotes = [
  {
    id: 1,
    title: "Web development",
    course: "CSE 2200",
    updated: "Edited today",
    hue: "blue",
  },
  {
    id: 2,
    title: "Numerical methods",
    course: "CSE 2202",
    updated: "Edited yesterday",
    hue: "violet",
  },
  {
    id: 3,
    title: "Fourier transforms",
    course: "MATH 2203",
    updated: "Edited Aug 12",
    hue: "amber",
  },
];

export default function NotesPage() {
  const [items, setItems] = useState(initialNotes);
  const [query, setQuery] = useState("");
  const visible = items.filter((note) =>
    `${note.title} ${note.course}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <section className="page study-page">
      <PageHeader
        eyebrow="Study"
        title="Notes"
        description="Keep every lecture thought, formula, and revision note in one calm place."
        actions={
          <Button
            onClick={() =>
              setItems((current) => [
                {
                  id: Date.now(),
                  title: "Algorithms",
                  course: "2207",
                  updated: "Just now",
                  hue: "green",
                },
                ...current,
              ])
            }
          >
            <Plus size={17} /> New note
          </Button>
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
          <FolderOpen size={17} /> All courses
        </button>
      </div>
      <div className="notes-grid">
        {visible.map((note) => (
          <article className={`note-card note-card--${note.hue}`} key={note.id}>
            <span className="note-card__icon">
              <FileText size={20} />
            </span>
            <p>{note.course}</p>
            <h2>{note.title}</h2>
            <footer>
              <span>{note.updated}</span>
              <button type="button" aria-label={`Open ${note.title}`}>
                <ArrowUpRight size={17} />
              </button>
            </footer>
          </article>
        ))}
      </div>
      {!visible.length && (
        <p className="study-empty">No notes match that search.</p>
      )}
    </section>
  );
}
