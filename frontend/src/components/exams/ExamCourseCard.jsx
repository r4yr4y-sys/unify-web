import AssessmentItem from "./AssessmentItem";

export default function ExamCourseCard({ course, onToggle, onOpen }) {
  const quizzes = (course.assessments || []).filter((item) => item.type === "quiz");
  const labExams = (course.assessments || []).filter((item) => ["labMidterm", "labFinal"].includes(item.type));
  return (
    <article className="exam-course-card" role="button" tabIndex="0" onClick={() => onOpen(course)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onOpen(course); } }}>
      <p className="eyebrow">{course.code} · {course.courseType === "lab" ? "Lab course" : "Theory course"}</p>
      <h3>{course.title}</h3>
      {quizzes.length ? quizzes.map((assessment) => <AssessmentItem key={assessment.id} course={course} assessment={assessment} onToggle={onToggle} />) : <p className="exam-course-card__empty">No quizzes configured for this course.</p>}
      {course.courseType === "lab" && labExams.map((assessment) => <AssessmentItem key={assessment.id} course={course} assessment={assessment} onToggle={onToggle} />)}
    </article>
  );
}
