import { useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { PageHeader } from "../components/ui";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function EditRoutinePage() {
  const navigate = useNavigate();
  const [day, setDay] = useState("Monday");
  const [date, setDate] = useState("");
  const [classes, setClasses] = useState([]);
  const addClass = () =>
    setClasses((current) => [
      ...current,
      { id: Date.now(), name: "New course", start: "09:00", end: "10:30" },
    ]);
  const updateClass = (id, field, value) =>
    setClasses((current) =>
      current.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );

  return (
    <section className="page routine-page">
      <PageHeader
        eyebrow="Academic"
        title="Edit routine"
        description="Add, change, or remove classes from your schedule."
        actions={
          <Link className="routine-editor__done" to="/academic/routine">
            <ArrowLeft size={17} /> Back to routine
          </Link>
        }
      />
      <section className="routine-editor">
        <div className="routine-editor__header">
          <div>
            <p className="eyebrow">Edit current routine</p>
            <h2>Plan your classes</h2>
          </div>
          <button
            type="button"
            className="routine-editor__done"
            onClick={() => navigate("/academic/routine")}
          >
            Done
          </button>
        </div>
        <div className="routine-editor__controls">
          <label>
            Day
            <select
              value={day}
              onChange={(event) => setDay(event.target.value)}
            >
              {days.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            Date
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </label>
          <button
            type="button"
            className="routine-add-button"
            onClick={addClass}
          >
            <Plus size={18} /> Add class
          </button>
        </div>
        <div className="routine-editor__classes">
          {classes.map((course) => (
            <article className="routine-course-card" key={course.id}>
              <input
                aria-label="Course name"
                value={course.name}
                onChange={(event) =>
                  updateClass(course.id, "name", event.target.value)
                }
              />
              <div>
                <label>
                  Start
                  <input
                    aria-label="Course start time"
                    type="time"
                    value={course.start}
                    onChange={(event) =>
                      updateClass(course.id, "start", event.target.value)
                    }
                  />
                </label>
                <label>
                  End
                  <input
                    aria-label="Course end time"
                    type="time"
                    value={course.end}
                    onChange={(event) =>
                      updateClass(course.id, "end", event.target.value)
                    }
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={() =>
                  setClasses((current) =>
                    current.filter((item) => item.id !== course.id),
                  )
                }
              >
                Remove
              </button>
            </article>
          ))}
          {!classes.length && (
            <p className="routine-editor__empty">
              No classes added for {day} yet. Use “Add class” to start your
              routine.
            </p>
          )}
        </div>
      </section>
    </section>
  );
}
