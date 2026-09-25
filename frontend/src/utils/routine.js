export const ROUTINE_DAYS = ["Sun", "Mon", "Tues", "Wed", "Thurs"];

const ROUTINE_STORAGE_KEY = "unify-routine-classes";

export function getRoutineClasses() {
  try {
    const saved = localStorage.getItem(ROUTINE_STORAGE_KEY);
    const classes = saved ? JSON.parse(saved) : [];
    return Array.isArray(classes) ? classes : [];
  } catch {
    return [];
  }
}

export function saveRoutineClasses(classes) {
  localStorage.setItem(ROUTINE_STORAGE_KEY, JSON.stringify(classes));
}
