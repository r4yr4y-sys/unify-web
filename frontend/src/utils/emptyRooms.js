const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const getDayAndTime = (date = new Date()) => ({
  day: WEEKDAY_NAMES[date.getDay()],
  time: `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`,
});

export const getSearchAvailability = (day, time) => {
  if (day === "Friday" || day === "Saturday") return "weekend";
  const minutes = timeToMinutes(time);
  if (minutes < timeToMinutes("08:00")) return minutes < 360 ? "after-hours" : "early";
  if (minutes >= timeToMinutes("18:00")) return "after-hours";
  return "available";
};

export const findEmptyRooms = (rooms, day, time) => {
  const currentTime = timeToMinutes(time);
  return rooms.flatMap((room) => {
    const interval = room.empty[day]?.find(
      ([start, end]) =>
        timeToMinutes(start) <= currentTime && currentTime < timeToMinutes(end),
    );
    return interval ? [{ ...room, freeUntil: interval[1] }] : [];
  });
};

export const formatTime = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${String(minutes).padStart(2, "0")} ${suffix}`;
};

export const formatRemainingTime = (time, freeUntil) => {
  const remaining = timeToMinutes(freeUntil) - timeToMinutes(time);
  const hours = Math.floor(remaining / 60);
  const minutes = remaining % 60;
  if (hours && minutes) return `${hours} hour ${minutes} minutes`;
  if (hours) return `${hours} hour${hours === 1 ? "" : "s"}`;
  return `${minutes} minutes`;
};
