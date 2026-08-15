import { useState } from "react";
import {
  BookOpen,
  CalendarDays,
  ChevronDown,
  CircleUserRound,
  GraduationCap,
  Home,
  Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";
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
      { label: "Notes", to: "/study/notes" },
      { label: "Resources", to: "/study/resources" },
      { label: "Study plans", to: "/study/plans" },
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
    ],
  },
];
const lowerNavigation = [
  { label: "Profile", to: "/profile", icon: CircleUserRound },
  { label: "Settings", to: "/settings", icon: Settings },
];
function NavigationGroup({ item }) {
  const [open, setOpen] = useState(false);
  const Icon = item.icon;
  if (!item.children)
    return (
      <NavLink className="nav-link" to={item.to}>
        <Icon size={19} />
        <span>{item.label}</span>
      </NavLink>
    );
  return (
    <div className={`nav-group ${open ? "is-open" : ""}`}>
      <div className="nav-group__row">
        <NavLink className="nav-link" to={item.to}>
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
  return (
    <aside className="sidebar">
      <NavLink className="brand" to="/dashboard" aria-label="Unify dashboard">
        <img className="brand-logo" src={unifyLogo} alt="Unify" />
      </NavLink>
      <nav className="sidebar-nav" aria-label="Main navigation">
        {navigation.map((item) => (
          <NavigationGroup key={item.to} item={item} />
        ))}
      </nav>
      <nav
        className="sidebar-nav sidebar-nav--lower"
        aria-label="Account navigation"
      >
        {lowerNavigation.map((item) => (
          <NavigationGroup key={item.to} item={item} />
        ))}
      </nav>
    </aside>
  );
}
