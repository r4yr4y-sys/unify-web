import AssessmentItem from "./AssessmentItem";

export default function ExamBracket({ title, courses, type, onToggle }) {
  return (
    <section className="exam-bracket">
      <div className="exam-bracket__heading"><p className="eyebrow">Exam bracket</p><h2>{title}</h2></div>
      {courses.length ? courses.map((course) => {
        const assessment = (course.assessments || []).find((item) => item.type === type);
        return assessment ? <div className="exam-bracket__course" key={course.id}><span>{course.title}</span><AssessmentItem course={course} assessment={assessment} onToggle={onToggle} /></div> : null;
      }) : <p className="exam-bracket__empty">No courses in this group yet.</p>}
    </section>
  );
}
