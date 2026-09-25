import { useEffect, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  ChevronDown,
  CircleUserRound,
  GraduationCap,
  Home,
  Layers,
  LifeBuoy,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import unifyLogo from "../../assets/unify official logo.png";

const navigation = [
  { label: "Dashboard", to: "/dashboard", icon: Home },
  {
    label: "Academic",
    to: "/academic",
    icon: GraduationCap,
    children: [
      { label: "Courses", to: "/academic/courses" },
      { label: "Routine", to: "/academic/routine" },
      { label: "Assignments", to: "/academic/assignments" },
      { label: "Grades & GPA", to: "/academic/grades" },
      { label: "Exams", to: "/academic/exams" },
    ],
  },
  {
    label: "Study",
    to: "/study",
    icon: BookOpen,
    children: [
      { label: "Study Timer", to: "/study/timer" },
      { label: "Notes", to: "/study/notes" },
      { label: "Resources", to: "/study/resources" },
      { label: "Study plans", to: "/study/plans" },
      { label: "Flashcards", to: "/study/flashcards", icon: Layers },
    ],
  },
  {
    label: "Campus Life",
    to: "/campus-life",
    icon: CalendarDays,
    children: [
      { label: "Announcements", to: "/campus-life/announcements" },
      { label: "Events", to: "/campus-life/events" },
      { label: "Lost & Found", to: "/campus-life/lost-found" },
      { label: "Marketplace", to: "/campus-life/marketplace" },
      { label: "Empty Rooms", to: "/campus-life/empty-rooms" },
    ],
  },
];
const lowerNavigation = [
  { label: "Profile", to: "/profile", icon: CircleUserRound },
  { label: "Support", to: "/settings", icon: LifeBuoy },
];
function NavigationGroup({ item, onNavigate }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const Icon = item.icon;
  const isActiveGroup =
    item.children?.some(
      (child) =>
        location.pathname === child.to ||
        location.pathname.startsWith(`${child.to}/`),
    ) || location.pathname === item.to;

  useEffect(() => {
    if (isActiveGroup) setOpen(true);
  }, [isActiveGroup]);

  if (!item.children)
    return (
      <NavLink className="nav-link" to={item.to} onClick={onNavigate}>
        <Icon size={19} />
        <span>{item.label}</span>
      </NavLink>
    );
  return (
    <div className={`nav-group ${open ? "is-open" : ""}`}>
      <div className="nav-group__row">
        <NavLink className="nav-link" to={item.to} onClick={onNavigate}>
          <Icon size={19} />
          <span>{item.label}</span>
        </NavLink>
        <button
          className="nav-expand"
          type="button"
          onClick={() => setOpen(!open)}
          aria-label={`Toggle ${item.label} menu`}
          aria-expanded={open}
        >
          <ChevronDown size={16} />
        </button>
      </div>
      {open && (
        <div className="nav-submenu">
          {item.children.map((child) => (
            <NavLink key={child.to} className="nav-sublink" to={child.to}>
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}
export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <>
      <button
        className="mobile-nav-toggle"
        type="button"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
        aria-controls="primary-sidebar"
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <X size={21} /> : <Menu size={21} />}
      </button>
      {open && <button className="sidebar-scrim" type="button" aria-label="Close navigation menu" onClick={close} />}
      <aside id="primary-sidebar" className={`sidebar ${open ? "is-open" : ""}`}>
        <NavLink className="brand" to="/dashboard" aria-label="Unify dashboard" onClick={close}>
          <img className="brand-logo" src={unifyLogo} alt="Unify" />
        </NavLink>
        <nav className="sidebar-nav" aria-label="Main navigation">
          {navigation.map((item) => (
            <NavigationGroup key={item.to} item={item} onNavigate={close} />
          ))}
        </nav>
        <nav
          className="sidebar-nav sidebar-nav--lower"
          aria-label="Account navigation"
        >
          {lowerNavigation.map((item) => (
            <NavigationGroup key={item.to} item={item} onNavigate={close} />
          ))}
          <NavLink className="nav-link nav-link--logout" to="/logout" onClick={close}>
            <LogOut size={19} />
            <span>Log out</span>
          </NavLink>
        </nav>
      </aside>
    </>
  );
}
