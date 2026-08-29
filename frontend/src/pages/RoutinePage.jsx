import { useState } from "react";
import { CalendarDays, Pencil, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/ui";

export default function RoutinePage() {
  const [uploadedFile, setUploadedFile] = useState("");

  return (
    <section className="page routine-page">
      <PageHeader
        eyebrow="Academic"
        title="Routine"
        description="Keep your class schedule close at hand."
      />
      <div className="routine-actions">
        <label className="routine-action-card">
          <span className="routine-action-card__icon">
            <Upload size={21} />
          </span>
          <span>
            <strong>Upload new routine</strong>
            <small>{uploadedFile || "Add your latest class schedule"}</small>
          </span>
          <input
            type="file"
            accept=".pdf,image/*"
            onChange={(event) =>
              setUploadedFile(event.target.files?.[0]?.name || "")
            }
          />
        </label>
        <Link className="routine-action-card" to="/academic/routine/edit">
          <span className="routine-action-card__icon">
            <Pencil size={20} />
          </span>
          <span>
            <strong>Edit current routine</strong>
            <small>Update a class, room, or time</small>
          </span>
        </Link>
      </div>
      <section className="today-class-card">
        <div className="today-class-card__heading">
          <span className="today-class-card__icon">
            <CalendarDays size={20} />
          </span>
          <div>
            <p className="eyebrow">Today's class</p>
            <h2>Your schedule is clear</h2>
          </div>
        </div>
        <p className="today-class-card__empty">
          Upload your routine to see today's classes here.
        </p>
      </section>
    </section>
  );
}
