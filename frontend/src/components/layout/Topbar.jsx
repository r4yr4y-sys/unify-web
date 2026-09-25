import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { Bell, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { IconButton } from "../ui";
import profilePicture from "../../assets/Profile_pic.jpg";
import { assessmentLabel, formatSchedule, isUpcoming, upcomingAssessments } from "../../utils/assessments";

const interestedEvents = (events) => {
  return events.filter((event) => event.isGoing && isUpcoming(event.date));
};

export default function Topbar() {
  const greetingRef = useRef(null);
  const [name, setName] = useState("there");
  const [avatarUrl, setAvatarUrl] = useState(profilePicture);
  const [notifications, setNotifications] = useState([]);
  const [eventNotifications, setEventNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return undefined;
    let active = true;
    const loadProfile = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const result = await response.json();
        if (response.ok && active) {
          setName(result.user.profile?.name?.trim().split(/\s+/)[0] || "there");
          setAvatarUrl(result.user.profile?.avatarUrl || profilePicture);
        }
      } catch (_error) {
        // The profile page will show a request error if the API remains unavailable.
      }
    };
    const handleProfileUpdate = (event) => {
      setName(event.detail?.profile?.name?.trim().split(/\s+/)[0] || "there");
      setAvatarUrl(event.detail?.profile?.avatarUrl || profilePicture);
    };
    loadProfile();
    window.addEventListener("unify-profile-updated", handleProfileUpdate);
    return () => {
      active = false;
      window.removeEventListener("unify-profile-updated", handleProfileUpdate);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return undefined;
    let active = true;
    const loadUpcoming = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const semesterResponse = await fetch(`${base}/api/semesters`, { headers });
        const semesterResult = await semesterResponse.json();
        const semester = semesterResult.semesters?.find((item) => item.isCurrent);
        if (!semester) return;
        const coursesResponse = await fetch(`${base}/api/courses?semesterId=${semester.id}`, { headers });
        const courseResult = await coursesResponse.json();
        if (coursesResponse.ok && active)
          setNotifications(upcomingAssessments(courseResult.courses || []));
      } catch (_error) {
        // Notification data is non-blocking; the Exams page can surface API errors.
      }
    };
    loadUpcoming();
    window.addEventListener("unify-assessments-updated", loadUpcoming);
    return () => {
      active = false;
      window.removeEventListener("unify-assessments-updated", loadUpcoming);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return undefined;
    let active = true;
    let loadedEvents = [];
    const refreshInterestedEvents = () => setEventNotifications(interestedEvents(loadedEvents));
    const handleAttendanceUpdate = (notification) => {
      if (notification.detail?.event) {
        loadedEvents = loadedEvents.map((event) => event._id === notification.detail.event._id ? notification.detail.event : event);
      }
      refreshInterestedEvents();
    };
    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/events`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const result = await response.json();
        if (response.ok && active) {
          loadedEvents = result.events || [];
          refreshInterestedEvents();
        }
      })
      .catch(() => {
        // Event notifications are non-blocking; the Events page can surface API errors.
      });
    window.addEventListener("unify-interested-events-updated", handleAttendanceUpdate);
    return () => {
      active = false;
      window.removeEventListener("unify-interested-events-updated", handleAttendanceUpdate);
    };
  }, []);

  useEffect(() => {
    const greeting = greetingRef.current;
    if (
      !greeting ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return undefined;

    const animation = animate(greeting, {
      y: [0, -7, 0],
      rotate: [0, -4, 0],
      duration: 620,
      ease: "outExpo",
    });

    return () => {
      animation.revert();
    };
  }, []);

  return (
    <header className="topbar">
      <div className="topbar__welcome">
        <p>Student workspace</p>
        <span>Stay on top of your semester</span>
      </div>
      <div className="topbar__actions">
        <button className="search-trigger" type="button">
          <Search size={18} />
          <span>Search your workspace</span>
          <kbd>⌘ K</kbd>
        </button>
        <div className="topbar-notifications">
        <IconButton label="Notifications" className={notifications.length || eventNotifications.length ? "topbar-notifications__bell has-upcoming" : "topbar-notifications__bell"} onClick={() => setNotificationsOpen((current) => !current)} aria-expanded={notificationsOpen}>
          <Bell size={19} />
          {notifications.length + eventNotifications.length > 0 && <span className="topbar-notifications__badge">{notifications.length + eventNotifications.length}</span>}
        </IconButton>
        {notificationsOpen && <section className="topbar-notifications__panel" aria-label="Upcoming notifications">
          <h2>Coming up</h2>
          {notifications.length ? <ul>{notifications.map(({ course, assessment }) => <li key={`${course.id}-${assessment.id}`}><strong>{course.title} — {assessmentLabel(assessment, course.courseType)}</strong><span>{formatSchedule(assessment)}</span></li>)}</ul> : <p>No assessments in the next 3 days.</p>}
          {eventNotifications.length > 0 && <ul>{eventNotifications.map((event) => <li key={`event-${event._id}`}><strong>Event: {event.title}</strong><span>{new Date(`${event.date}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" })} · {event.time}</span></li>)}</ul>}
          {notifications.length + eventNotifications.length === 0 && <p>No events or assessments in the next 3 days.</p>}
        </section>}
        </div>
        <span ref={greetingRef} className="topbar__greeting">
          Hello, {name}!
        </span>
        <Link className="user-avatar" to="/profile" aria-label="Open profile">
          <img src={avatarUrl} alt="Your profile" />
        </Link>
      </div>
    </header>
  );
}
