import { useState } from "react";
import { ArrowUpRight, FolderOpen, Upload } from "lucide-react";
import { PageHeader } from "../components/ui";

const initialResources = [
  { id: 1, type: "PDF", title: "Algorithms", course: "CSE 2207", detail: "Lecture slides", hue: "blue" },
  { id: 2, type: "LINK", title: "MIT OpenCourseWare", course: "All", detail: "External learning resource", hue: "violet" },
  { id: 3, type: "PDF", title: "Numerical methods", course: "CSE 2202", detail: "Practice problems ", hue: "amber" },
];

export default function ResourcesPage() {
  const [items, setItems] = useState(initialResources);
  return <section className="page study-page">
    <PageHeader eyebrow="Study" title="Study resources" description="Collect the files and links that make revision a little easier." actions={<label className="button button--primary resource-upload"><Upload size={17} /> Upload resource<input type="file" onChange={(event) => { const file = event.target.files?.[0]; if (file) setItems((current) => [{ id: Date.now(), type: "FILE", title: file.name, course: "Unsorted", detail: "Uploaded just now", hue: "green" }, ...current]); }} /></label>} />
    <section className="resource-feature"><span><FolderOpen size={26} /></span><div><p className="eyebrow">Your library</p><h2>Everything you need for your next study session.</h2><p>Upload lecture files or save useful links, then keep them organized by course.</p></div><strong>{items.length}<small>resources</small></strong></section>
    <div className="resource-list">{items.map((resource) => <article className="resource-item" key={resource.id}><span className={`resource-item__icon resource-item__icon--${resource.hue}`}>{resource.type}</span><div><p>{resource.course}</p><h2>{resource.title}</h2><small>{resource.detail}</small></div><button type="button" aria-label={`Open ${resource.title}`}><ArrowUpRight size={18} /></button></article>)}</div>
  </section>;
}
