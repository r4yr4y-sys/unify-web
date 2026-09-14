export const assessmentLabel = (assessment, courseType) => {
  if (assessment.type === "quiz")
    return `${courseType === "lab" ? "Lab " : ""}Quiz ${assessment.number}`;
  return {
    midterm: "Midterm",
    final: "Semester Final",
    labMidterm: "Lab Midterm",
    labFinal: "Lab Final",
  }[assessment.type] || assessment.type;
};

export const isUpcoming = (date) => {
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const scheduled = new Date(`${date}T00:00:00`);
  const end = new Date(today);
  end.setDate(end.getDate() + 3);
  return scheduled >= today && scheduled <= end;
};

export const formatSchedule = (assessment) => {
  if (!assessment.date) return "Unscheduled";
  const date = new Date(`${assessment.date}T00:00:00`).toLocaleDateString(
    undefined,
    { month: "short", day: "numeric", year: "numeric" },
  );
  if (!assessment.time) return date;
  const [hour, minute] = assessment.time.split(":").map(Number);
  const time = new Date(2000, 0, 1, hour, minute).toLocaleTimeString(
    undefined,
    { hour: "numeric", minute: "2-digit" },
  );
  return `${date} · ${time}`;
};

export const upcomingAssessments = (courses) =>
  courses
    .flatMap((course) =>
      (course.assessments || [])
        .filter((assessment) => isUpcoming(assessment.date) && assessment.status !== "completed")
        .map((assessment) => ({ course, assessment })),
    )
    .sort((a, b) => `${a.assessment.date}${a.assessment.time || ""}`.localeCompare(`${b.assessment.date}${b.assessment.time || ""}`));
