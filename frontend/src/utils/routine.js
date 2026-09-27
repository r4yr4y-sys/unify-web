export const ROUTINE_DAYS = ["Sun", "Mon", "Tues", "Wed", "Thurs"];

const api = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function requestRoutine(path, options = {}) {
  const response = await fetch(`${api}/api/routine${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Unable to load your routine.");
  return result.classes;
}

export function getRoutineClasses() {
  return requestRoutine("");
}

export function saveRoutineClasses(classes) {
  return requestRoutine("", { method: "PUT", body: JSON.stringify({ classes }) });
}
