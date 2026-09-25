import { useEffect, useMemo, useRef, useState } from "react";
import { animate } from "animejs";
import { Bell, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { IconButton } from "../ui";
import profilePicture from "../../assets/Profile_pic.jpg";
import { assessmentLabel, formatSchedule, isUpcoming, upcomingAssessments } from "../../utils/assessments";

const interestedEvents = (events) => {
  return events.filter((event) => event.isGoing && isUpcoming(event.date));
};

const PAGES = [
  { label: "Dashboard", path: "/dashboard", aliases: ["dashboard"] },
  { label: "Academic", path: "/academic", aliases: ["academic", "academics"] },
  { label: "Courses", path: "/academic/courses", aliases: ["course", "courses"] },
  { label: "Assignments", path: "/academic/assignments", aliases: ["assignment", "assignments"] },
  { label: "Exams", path: "/academic/exams", aliases: ["exam", "exams"] },
  { label: "Notes", path: "/study/notes", aliases: ["note", "notes"] },
  { label: "Study", path: "/study", aliases: ["study", "studies", "study timer"] },
  { label: "Announcements", path: "/campus-life/announcements", aliases: ["announcement", "announcements"] },
  { label: "Events", path: "/campus-life/events", aliases: ["event", "events"] },
  { label: "Lost & Found", path: "/campus-life/lost-found", aliases: ["lost", "found", "lost and found", "lost & found"] },
  { label: "Marketplace", path: "/campus-life/marketplace", aliases: ["market", "marketplace"] },
  { label: "Profile", path: "/profile", aliases: ["profile"] },
  { label: "Support", path: "/settings", aliases: ["support", "help"] },
];

export default function Topbar() {
  const greetingRef = useRef(null);
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const [name, setName] = useState("there");
  const [avatarUrl, setAvatarUrl] = useState(profilePicture);
  const [notifications, setNotifications] = useState([]);
  const [assignmentNotifications, setAssignmentNotifications] = useState([]);
  const [eventNotifications, setEventNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    const loadUpcomingAssignments = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/assignments`, { headers: { Authorization: `Bearer ${token}` } });
        const result = await response.json();
        if (response.ok && active) setAssignmentNotifications((result.assignments || []).filter((assignment) => isUpcoming(assignment.dueDate)).sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || "")));
      } catch (_error) {
        // Assignment reminders use the same non-blocking, three-day pattern as exams.
      }
    };
    loadUpcomingAssignments();
    window.addEventListener("unify-assignments-updated", loadUpcomingAssignments);
    return () => {
      active = false;
      window.removeEventListener("unify-assignments-updated", loadUpcomingAssignments);
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

  const suggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return PAGES.filter((page) =>
      page.aliases.some((alias) => alias.toLowerCase().startsWith(q)),
    );
  }, [searchQuery]);

  const navigateToPage = (path) => {
    navigate(path);
    setSearchQuery("");
    setShowSuggestions(false);
    setHighlightedIndex(0);
  };

  const handleSearchKeyDown = (event) => {
    if (!showSuggestions) return;
    if (event.key === "Escape") {
      event.preventDefault();
      setShowSuggestions(false);
      setSearchQuery("");
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((prev) =>
        Math.min(prev + 1, Math.max(suggestions.length - 1, 0)),
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (suggestions.length > 0) {
        const idx = Math.max(
          0,
          Math.min(highlightedIndex, suggestions.length - 1),
        );
        navigateToPage(suggestions[idx].path);
      }
    }
  };

  return (
    <header className="topbar">
      <div className="topbar__welcome">
        <p>Student workspace</p>
        <span>Stay on top of your semester</span>
      </div>
      <div className="topbar__actions">
        <div className="search-trigger" ref={searchRef}>
          <Search size={18} />
          <input
            ref={inputRef}
            type="search"
            className="search-trigger__input"
            placeholder="Search your workspace"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setShowSuggestions(true);
              setHighlightedIndex(0);
            }}
            onFocus={() => {
              if (searchQuery.trim()) setShowSuggestions(true);
            }}
            onBlur={() => {}}
            onKeyDown={handleSearchKeyDown}
            aria-autocomplete="list"
            aria-expanded={showSuggestions}
            aria-label="Search pages"
          />
          <kbd>⌘ K</kbd>
          {showSuggestions && (
            <ul className="search-suggestions" role="listbox">
              {suggestions.length > 0 ? (
                suggestions.map((page, index) => (
                  <li
                    key={page.path}
                    role="option"
                    aria-selected={index === highlightedIndex}
                    className={
                      index === highlightedIndex
                        ? "is-highlighted"
                        : ""
                    }
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onMouseDown={
                      (event) => event.preventDefault()
                    }
                    onClick={() => navigateToPage(page.path)}
                  >
                    {page.label}
                  </li>
                ))
              ) : (
                <li className="search-no-match">No matching page found</li>
              )}
            </ul>
          )}
        </div>
        <div className="topbar-notifications">
        <IconButton label="Notifications" className={notifications.length || assignmentNotifications.length || eventNotifications.length ? "topbar-notifications__bell has-upcoming" : "topbar-notifications__bell"} onClick={() => setNotificationsOpen((current) => !current)} aria-expanded={notificationsOpen}>
          <Bell size={19} />
          {notifications.length + assignmentNotifications.length + eventNotifications.length > 0 && <span className="topbar-notifications__badge">{notifications.length + assignmentNotifications.length + eventNotifications.length}</span>}
        </IconButton>
        {notificationsOpen && <section className="topbar-notifications__panel" aria-label="Upcoming notifications">
          <h2>Coming up</h2>
          {assignmentNotifications.length > 0 && <ul>{assignmentNotifications.map((assignment) => <li key={`assignment-${assignment.id}`}><strong>{assignment.course?.title || "Course"} — Assignment {assignment.number}</strong><span>{assignment.topic || "Assignment details to be added"} · Due {new Date(`${assignment.dueDate}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span></li>)}</ul>}
          {notifications.length ? <ul>{notifications.map(({ course, assessment }) => <li key={`${course.id}-${assessment.id}`}><strong>{course.title} — {assessmentLabel(assessment, course.courseType)}</strong><span>{formatSchedule(assessment)}</span></li>)}</ul> : <p>No assessments in the next 3 days.</p>}
          {eventNotifications.length > 0 && <ul>{eventNotifications.map((event) => <li key={`event-${event._id}`}><strong>Event: {event.title}</strong><span>{new Date(`${event.date}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" })} · {event.time}</span></li>)}</ul>}
          {notifications.length + assignmentNotifications.length + eventNotifications.length === 0 && <p>No events or deadlines in the next 3 days.</p>}
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
