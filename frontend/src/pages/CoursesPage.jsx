import { useEffect, useState } from "react";
import { Plus, BookOpen, CalendarDays } from "lucide-react";
import { Button, PageHeader, SectionCard } from "../components/ui";

const api = import.meta.env.VITE_API_URL || "http://localhost:5000";
const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("authToken")}`,
});
const request = async (path, options = {}) => {
  const response = await fetch(`${api}${path}`, {
    ...options,
    headers: { ...headers(), ...options.headers },
  });
  const result = response.status === 204 ? {} : await response.json();
  if (!response.ok)
    throw new Error(result.message || "Unable to save course data.");
  return result;
};
const blankCourse = {
  code: "",
  title: "",
  credits: "",
  totalClasses: "",
  totalQuizzes: "",
  totalAssignments: "",
  hasMidterm: false,
  hasFinal: false,
};

function CourseForm({ semester, onClose, onSaved }) {
  const [form, setForm] = useState(blankCourse);
  const [error, setError] = useState("");
  const change = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const submit = async (e) => {
    e.preventDefault();
    try {
      const result = await request("/api/courses", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          semesterId: semester.id,
          credits: Number(form.credits),
          totalClasses: Number(form.totalClasses),
          totalQuizzes: Number(form.totalQuizzes),
          totalAssignments: Number(form.totalAssignments),
        }),
      });
      onSaved(result.course);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <div className="courses-modal-backdrop">
      <form className="courses-modal" onSubmit={submit}>
        <h2>Add course</h2>
        <div className="courses-form-grid">
          {[
            ["code", "Course code / number"],
            ["title", "Course title"],
            ["credits", "Credits"],
            ["totalClasses", "Number of classes"],
            ["totalQuizzes", "Number of quizzes"],
            ["totalAssignments", "Number of assignments"],
          ].map(([key, label]) => (
            <label key={key}>
              {label}
              <input
                required={key === "code" || key === "title"}
                type={
                  [
                    "credits",
                    "totalClasses",
                    "totalQuizzes",
                    "totalAssignments",
                  ].includes(key)
                    ? "number"
                    : "text"
                }
                min="0"
                step={key === "credits" ? "0.25" : "1"}
                value={form[key]}
                onChange={(e) => change(key, e.target.value)}
              />
            </label>
          ))}
          <label>
            <input
              type="checkbox"
              checked={form.hasMidterm}
              onChange={(e) => change("hasMidterm", e.target.checked)}
            />{" "}
            Has midterm
          </label>
          <label>
            <input
              type="checkbox"
              checked={form.hasFinal}
              onChange={(e) => change("hasFinal", e.target.checked)}
            />{" "}
            Has final exam
          </label>
        </div>
        {error && <p className="courses-error">{error}</p>}
        <footer>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Create course</Button>
        </footer>
      </form>
    </div>
  );
}

function CourseDetail({ course, onClose, onSaved }) {
  const [current, setCurrent] = useState(course);
  const [error, setError] = useState("");
  const save = async (next) => {
    try {
      const result = await request(`/api/courses/${course.id}`, {
        method: "PUT",
        body: JSON.stringify(next),
      });
      setCurrent(result.course);
      onSaved(result.course);
    } catch (err) {
      setError(err.message);
    }
  };
  const attendance = (number, status) =>
    save({
      ...current,
      attendance: current.attendance.map((item) =>
        item.number === number ? { ...item, status } : item,
      ),
    });
  const assess = (assessment, status) => {
    let maxMarks = null,
      marksObtained = null;
    if (status !== "pending") {
      maxMarks = Number(
        window.prompt("Out of how many marks?", assessment.maxMarks || ""),
      );
      if (!Number.isFinite(maxMarks) || maxMarks < 0) return;
      if (status === "completed") {
        marksObtained = Number(
          window.prompt(
            "How much did you get?",
            assessment.marksObtained || "",
          ),
        );
        if (!Number.isFinite(marksObtained) || marksObtained < 0) return;
      }
    }
    save({
      ...current,
      assessments: current.assessments.map((item) =>
        item.id === assessment.id
          ? { ...item, status, marksObtained, status: status, maxMarks }
          : item,
      ),
    });
  };
  const groups = [
    ["quiz", "Quizzes"],
    ["assignment", "Assignments"],
    ["midterm", "Midterm"],
    ["final", "Final exam"],
  ];
  return (
    <div className="courses-modal-backdrop">
      <section className="courses-modal courses-detail">
        <button className="courses-close" onClick={onClose}>
          ×
        </button>
        <p className="eyebrow">{current.code}</p>
        <h2>{current.title}</h2>
        <p>
          {current.credits} credits · {current.totalClasses} classes
        </p>
        {error && <p className="courses-error">{error}</p>}
        <h3>Class attendance</h3>
        <div className="course-items">
          {current.attendance.map((item) => (
            <div key={item.number}>
              Class {item.number}
              <button
                onClick={() =>
                  attendance(
                    item.number,
                    item.status === "attended" ? "missed" : "attended",
                  )
                }
                className={item.status === "attended" ? "is-done" : ""}
              >
                {item.status === "attended"
                  ? "Attended"
                  : item.status === "missed"
                    ? "Missed"
                    : "Mark attendance"}
              </button>
            </div>
          ))}
        </div>
        {groups.map(([type, label]) => {
          const items = current.assessments.filter(
            (item) => item.type === type,
          );
          return items.length ? (
            <section key={type}>
              <h3>{label}</h3>
              <div className="course-items">
                {items.map((item) => (
                  <div key={item.id}>
                    {label.replace(/s$/, " ")} {item.number}{" "}
                    <span>
                      {item.status === "pending"
                        ? "Not completed"
                        : `${item.marksObtained} / ${item.maxMarks} · ${item.status}`}
                    </span>
                    <button onClick={() => assess(item, "completed")}>
                      Completed
                    </button>
                    <button onClick={() => assess(item, "missed")}>
                      Missed
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ) : null;
        })}
      </section>
    </div>
  );
}

export default function CoursesPage() {
  const [semesters, setSemesters] = useState([]),
    [courses, setCourses] = useState([]),
    [active, setActive] = useState(null),
    [adding, setAdding] = useState(false),
    [detail, setDetail] = useState(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  const load = async () => {
    try {
      const [a, b] = await Promise.all([
        request("/api/semesters"),
        request("/api/courses"),
      ]);
      setSemesters(a.semesters);
      setCourses(b.courses);
      setActive(
        (id) =>
          id ||
          a.semesters.find((item) => item.isCurrent)?.id ||
          a.semesters[0]?.id ||
          null,
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const current = semesters.find((item) => item.id === active);
  const addSemester = async () => {
    const name = window.prompt("Semester name (for example, Fall 2026)");
    if (!name) return;
    try {
      const { semester } = await request("/api/semesters", {
        method: "POST",
        body: JSON.stringify({ name, isCurrent: true }),
      });
      setSemesters((items) => [
        ...items.map((item) => ({ ...item, isCurrent: false })),
        semester,
      ]);
      setActive(semester.id);
    } catch (err) {
      setError(err.message);
    }
  };
  const rename = async () => {
    const name = window.prompt("Semester name", current.name);
    if (!name) return;
    try {
      const { semester } = await request(`/api/semesters/${current.id}`, {
        method: "PUT",
        body: JSON.stringify({ name }),
      });
      setSemesters((items) =>
        items.map((item) => (item.id === semester.id ? semester : item)),
      );
    } catch (err) {
      setError(err.message);
    }
  };
  const changeSemester = async (id) => {
    try {
      const { semester } = await request(`/api/semesters/${id}`, {
        method: "PUT",
        body: JSON.stringify({ isCurrent: true }),
      });
      setSemesters((items) =>
        items.map((item) => ({ ...item, isCurrent: item.id === semester.id })),
      );
      setActive(id);
    } catch (err) {
      setError(err.message);
    }
  };
  const ownCourses = courses.filter((course) => course.semester === active);
  return (
    <section className="page courses-page">
      <PageHeader
        eyebrow="Academic"
        title="Courses"
        description="Track raw attendance and assessment records without assuming a grading formula."
        actions={
          <Button onClick={addSemester}>
            <Plus size={17} /> New semester
          </Button>
        }
      />
      {error && <p className="courses-error">{error}</p>}
      {loading ? (
        <p>Loading courses…</p>
      ) : current ? (
        <>
          <SectionCard title={`Current semester: ${current.name}`}>
            <div className="courses-actions">
              <Button variant="secondary" onClick={rename}>
                Rename
              </Button>
              <Button onClick={() => setAdding(true)}>
                <Plus size={16} /> Add course
              </Button>
            </div>
            {ownCourses.length ? (
              <div className="courses-grid">
                {ownCourses.map((course) => (
                  <button
                    className="course-card"
                    key={course.id}
                    onClick={() => setDetail(course)}
                  >
                    <strong>{course.code}</strong>
                    <h3>{course.title}</h3>
                    <span>{course.credits} credits</span>
                    <small>
                      {course.totalClasses} classes · {course.totalQuizzes}{" "}
                      quizzes · {course.totalAssignments} assignments
                    </small>
                  </button>
                ))}
              </div>
            ) : (
              <p>No courses in this semester yet.</p>
            )}
          </SectionCard>
          <SectionCard title="Previous semesters">
            <div className="semester-list">
              {semesters
                .filter((item) => item.id !== active)
                .map((item) => (
                  <button key={item.id} onClick={() => changeSemester(item.id)}>
                    {item.name}
                    {item.isCurrent ? " · Current" : ""}
                  </button>
                ))}
            </div>
          </SectionCard>
        </>
      ) : (
        <SectionCard title="Start your academic record">
          <p>Create a semester to add courses.</p>
        </SectionCard>
      )}
      {adding && (
        <CourseForm
          semester={current}
          onClose={() => setAdding(false)}
          onSaved={(course) => setCourses((items) => [...items, course])}
        />
      )}{" "}
      {detail && (
        <CourseDetail
          course={detail}
          onClose={() => setDetail(null)}
          onSaved={(course) =>
            setCourses((items) =>
              items.map((item) => (item.id === course.id ? course : item)),
            )
          }
        />
      )}
    </section>
  );
}
