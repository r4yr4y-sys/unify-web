import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Droplets,
  GraduationCap,
  MapPin,
  Music2,
  Phone,
  School,
  UserRound,
} from "lucide-react";
import { BentoCard, BentoGrid, PageHeader } from "../components/ui";
import profilePicture from "../assets/Profile_pic.jpg";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const blankProfile = () => ({
  name: "",
  department: "",
  semester: "",
  status: "",
  bio: "",
  studentId: "",
  program: "",
  batch: "",
  universityEmail: "",
  phone: "",
  dateOfBirth: "",
  gender: "",
  bloodGroup: "",
  address: "",
  academicJourney: {
    school: { institution: "", years: "" },
    college: { institution: "", years: "" },
    university: { institution: "", years: "" },
  },
  emergencyContacts: [],
  socialLinks: {
    spotify: "",
    github: "",
    instagram: "",
    linkedin: "",
    facebook: "",
  },
});
const asForm = (profile = {}) => ({
  ...blankProfile(),
  ...profile,
  dateOfBirth: profile.dateOfBirth
    ? String(profile.dateOfBirth).slice(0, 10)
    : "",
  academicJourney: {
    ...blankProfile().academicJourney,
    ...profile.academicJourney,
  },
  socialLinks: { ...blankProfile().socialLinks, ...profile.socialLinks },
  emergencyContacts: profile.emergencyContacts || [],
});
const value = (item) => item || "Not provided";

export const STATUS_LIST = [
  { emoji: "😎", label: "Chilling" },
  { emoji: "☕", label: "Running on caffeine" },
  { emoji: "😊", label: "Happy for no reason" },
  { emoji: "🤠", label: "Its high noon" },
  { emoji: "🔄", label: "Mentally buffering" },
  { emoji: "🫠", label: "Barely surviving" },
  { emoji: "🧠", label: "Brain is braining" },
  { emoji: "😴", label: "I need a nap" },
  { emoji: "🔒", label: "Locked in" },
  { emoji: "🎧", label: "Just vibing" },
  { emoji: "🐢", label: "Taking it slow" },
  { emoji: "🔥", label: "Somehow on fire" },
  { emoji: "🌙", label: "Should probably be sleeping" },
  { emoji: "😮‍💨", label: "Made it through the day" },
  { emoji: "🪫", label: "Running on empty" },
];

export const STATUS_OPTIONS = STATUS_LIST.map((s) => `${s.emoji} ${s.label}`);

const STATUS_STYLES = {
  "Chilling": { bg: "#eaf4ff", text: "#0265a7", border: "#bee0ff", dot: "#0ea5e9" },
  "Running on caffeine": { bg: "#fdf5ea", text: "#965415", border: "#f8dfbe", dot: "#d97706" },
  "Happy for no reason": { bg: "#fefbe8", text: "#854d0e", border: "#fef08a", dot: "#eab308" },
  "Its high noon": { bg: "#fff1eb", text: "#b83d12", border: "#ffd5c4", dot: "#f97316" },
  "Mentally buffering": { bg: "#ecfeff", text: "#0e7490", border: "#a5f3fc", dot: "#06b6d4" },
  "Barely surviving": { bg: "#fef2f2", text: "#991b1b", border: "#fecaca", dot: "#ef4444" },
  "Brain is braining": { bg: "#f5f3ff", text: "#5b21b6", border: "#ddd6fe", dot: "#8b5cf6" },
  "I need a nap": { bg: "#f3f0ff", text: "#581c87", border: "#e9d5ff", dot: "#a855f7" },
  "Locked in": { bg: "#eef2ff", text: "#3730a3", border: "#c7d2fe", dot: "#4f46e5" },
  "Just vibing": { bg: "#f0fdf9", text: "#0f766e", border: "#ccfbf1", dot: "#14b8a6" },
  "Taking it slow": { bg: "#f4f8f3", text: "#2f693b", border: "#cfe5d3", dot: "#4ade80" },
  "Somehow on fire": { bg: "#fff1f2", text: "#be123c", border: "#fecdd3", dot: "#f43f5e" },
  "Should probably be sleeping": { bg: "#edf2f9", text: "#233876", border: "#cdd9ec", dot: "#3b82f6" },
  "Made it through the day": { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0", dot: "#22c55e" },
  "Running on empty": { bg: "#f1f5f9", text: "#475569", border: "#cbd5e1", dot: "#94a3b8" },
};

const getStatusInfo = (status) => {
  if (!status) return null;
  const raw = String(status).trim();
  const found = STATUS_LIST.find(
    (s) =>
      raw === `${s.emoji} ${s.label}` ||
      raw === s.label ||
      raw.toLowerCase().includes(s.label.toLowerCase()),
  );
  if (found) {
    const style = STATUS_STYLES[found.label] || {
      bg: "#f0fdf4",
      text: "#166534",
      border: "#bbf7d0",
      dot: "#22c55e",
    };
    return {
      emoji: found.emoji,
      label: found.label,
      displayText: `${found.emoji} ${found.label}`,
      ...style,
    };
  }
  return {
    emoji: "✨",
    label: raw,
    displayText: raw,
    bg: "#f0fdf4",
    text: "#166534",
    border: "#bbf7d0",
    dot: "#22c55e",
  };
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const formatDate = (dateString) => {
  if (!dateString) return "Not provided";
  const match = String(dateString).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, year, month, day] = match;
    const monthIndex = parseInt(month, 10) - 1;
    const monthName = MONTH_NAMES[monthIndex] || month;
    return `${day} ${monthName} ${year}`;
  }
  const d = new Date(dateString);
  if (!Number.isNaN(d.getTime())) {
    const day = String(d.getUTCDate()).padStart(2, "0");
    const monthName = MONTH_NAMES[d.getUTCMonth()];
    const year = d.getUTCFullYear();
    return `${day} ${monthName} ${year}`;
  }
  return String(dateString);
};

function GithubIcon({ size = 20, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function InstagramIcon({ size = 20, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function LinkedinIcon({ size = 20, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function FacebookIcon({ size = 20, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function XTwitterIcon({ size = 18, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const SOCIAL_CONFIG = [
  { key: "github", label: "GitHub", Icon: GithubIcon, color: "#24292f" },
  { key: "instagram", label: "Instagram", Icon: InstagramIcon, color: "#e1306c" },
  { key: "linkedin", label: "LinkedIn", Icon: LinkedinIcon, color: "#0a66c2" },
  { key: "facebook", label: "Facebook", Icon: FacebookIcon, color: "#1877f2" },
  { key: "twitter", label: "X / Twitter", Icon: XTwitterIcon, color: "#0f1419" },
  { key: "x", label: "X / Twitter", Icon: XTwitterIcon, color: "#0f1419" },
];

function InfoList({ items, icons = false }) {
  return (
    <dl className="profile-info-list">
      {items.map(([label, item, Icon]) => (
        <div className="profile-info-item" key={label}>
          <div className="profile-info-item__label">
            {icons && Icon && (
              <span className="profile-info-item__icon">
                <Icon size={16} />
              </span>
            )}
            <dt>{label}</dt>
          </div>
          <dd className="profile-info-item__value">{value(item)}</dd>
        </div>
      ))}
    </dl>
  );
}

function Editor({ initial, setup, saving, error, onSave, onCancel }) {
  const [form, setForm] = useState(() => asForm(initial));
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(
    initial.avatarUrl || profilePicture,
  );
  const chooseAvatar = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };
  useEffect(
    () => () => {
      if (avatarPreview.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
    },
    [avatarPreview],
  );
  const field = (name) => ({
    value: form[name],
    onChange: (e) => setForm((f) => ({ ...f, [name]: e.target.value })),
  });
  const journey = (stage, name) => ({
    value: form.academicJourney[stage][name],
    onChange: (e) =>
      setForm((f) => ({
        ...f,
        academicJourney: {
          ...f.academicJourney,
          [stage]: { ...f.academicJourney[stage], [name]: e.target.value },
        },
      })),
  });
  const social = (name) => ({
    value: form.socialLinks[name],
    onChange: (e) =>
      setForm((f) => ({
        ...f,
        socialLinks: { ...f.socialLinks, [name]: e.target.value },
      })),
  });
  const setContact = (index, name, item) =>
    setForm((f) => ({
      ...f,
      emergencyContacts: f.emergencyContacts.map((contact, i) =>
        i === index ? { ...contact, [name]: item } : contact,
      ),
    }));
  return (
    <BentoCard className="profile-editor">
      <div className="profile-editor__heading">
        <div>
          <p className="eyebrow">
            {setup ? "First-time setup" : "Keep it current"}
          </p>
          <h2>{setup ? "Complete your profile" : "Edit profile"}</h2>
        </div>
        {!setup && (
          <button
            className="profile-button secondary"
            type="button"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
      <p>
        Name, department, and semester are required. All other fields are
        optional.
      </p>
      <form
        className="profile-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSave(form, avatarFile);
        }}
      >
        <fieldset>
          <legend>Profile picture</legend>
          <div className="profile-picture-input">
            <img src={avatarPreview} alt="Profile picture preview" />
            <label>
              Choose picture
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={chooseAvatar}
              />
              <small>JPEG, PNG, or WebP up to 5 MB.</small>
            </label>
          </div>
        </fieldset>
        <fieldset>
          <legend>Identity</legend>
          <div className="profile-form__grid">
            <label>
              Name *<input required {...field("name")} />
            </label>
            <label>
              Department *<input required {...field("department")} />
            </label>
            <label>
              Semester *<input required {...field("semester")} />
            </label>
            <label>
              Status
              <select
                value={(() => {
                  if (!form.status) return "";
                  const match = STATUS_LIST.find(
                    (s) =>
                      form.status === `${s.emoji} ${s.label}` ||
                      form.status === s.label ||
                      form.status.toLowerCase().includes(s.label.toLowerCase()),
                  );
                  return match ? `${match.emoji} ${match.label}` : form.status;
                })()}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value }))
                }
              >
                <option value="">Select status…</option>
                {form.status &&
                  !STATUS_LIST.some(
                    (s) =>
                      form.status === `${s.emoji} ${s.label}` ||
                      form.status === s.label,
                  ) && <option value={form.status}>{form.status}</option>}
                {STATUS_LIST.map(({ emoji, label }) => {
                  const optVal = `${emoji} ${label}`;
                  return (
                    <option key={label} value={optVal}>
                      {emoji} {label}
                    </option>
                  );
                })}
              </select>
            </label>
            <label className="wide">
              Bio
              <textarea maxLength="500" {...field("bio")} />
            </label>
          </div>
        </fieldset>
        <fieldset>
          <legend>Academic information</legend>
          <div className="profile-form__grid">
            <label>
              Student ID
              <input {...field("studentId")} />
            </label>
            <label>
              Program
              <input {...field("program")} />
            </label>
            <label>
              Batch
              <input {...field("batch")} />
            </label>
            <label>
              University email
              <input type="email" {...field("universityEmail")} />
            </label>
          </div>
        </fieldset>
        <fieldset>
          <legend>Personal information</legend>
          <div className="profile-form__grid">
            <label>
              Phone
              <input {...field("phone")} />
            </label>
            <label>
              Date of birth
              <input type="date" {...field("dateOfBirth")} />
            </label>
            <label>
              Gender
              <select {...field("gender")}>
                <option value="">Select gender…</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </label>
            <label>
              Blood group
              <select {...field("bloodGroup")}>
                <option value="">Select blood group…</option>
                {form.bloodGroup && !["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].includes(form.bloodGroup) && (
                  <option value={form.bloodGroup}>{form.bloodGroup}</option>
                )}
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </label>
            <label className="wide">
              Address
              <input {...field("address")} />
            </label>
          </div>
        </fieldset>
        <fieldset>
          <legend>Academic journey</legend>
          {["school", "college", "university"].map((stage) => (
            <div className="profile-form__grid journey" key={stage}>
              <label>
                {stage[0].toUpperCase() + stage.slice(1)} institution
                <input {...journey(stage, "institution")} />
              </label>
              <label>
                Years
                <input
                  placeholder="e.g. 2022 – Present"
                  {...journey(stage, "years")}
                />
              </label>
            </div>
          ))}
        </fieldset>
        <fieldset>
          <legend>Emergency contacts</legend>
          {form.emergencyContacts.map((contact, index) => (
            <div className="profile-contact" key={index}>
              <input
                aria-label="Contact name"
                placeholder="Name"
                value={contact.name || ""}
                onChange={(e) => setContact(index, "name", e.target.value)}
              />
              <input
                aria-label="Relationship"
                placeholder="Relationship"
                value={contact.relationship || ""}
                onChange={(e) =>
                  setContact(index, "relationship", e.target.value)
                }
              />
              <input
                aria-label="Phone"
                placeholder="Phone"
                value={contact.phone || ""}
                onChange={(e) => setContact(index, "phone", e.target.value)}
              />
              <button
                type="button"
                className="profile-text-button"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    emergencyContacts: f.emergencyContacts.filter(
                      (_, i) => i !== index,
                    ),
                  }))
                }
              >
                Remove
              </button>
            </div>
          ))}
          {form.emergencyContacts.length < 5 && (
            <button
              type="button"
              className="profile-text-button"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  emergencyContacts: [
                    ...f.emergencyContacts,
                    { name: "", relationship: "", phone: "" },
                  ],
                }))
              }
            >
              + Add contact
            </button>
          )}
        </fieldset>
        <fieldset>
          <legend>Social links</legend>
          <div className="profile-form__grid">
            {["spotify", "github", "instagram", "linkedin", "facebook"].map(
              (link) => (
                <label key={link}>
                  {link[0].toUpperCase() + link.slice(1)} URL
                  <input type="url" placeholder="https://" {...social(link)} />
                </label>
              ),
            )}
          </div>
        </fieldset>
        {error && (
          <p className="profile-error" role="alert">
            {error}
          </p>
        )}
        <button className="profile-button" disabled={saving}>
          {saving ? "Saving…" : "Save profile"}
        </button>
      </form>
    </BentoCard>
  );
}

const styles = `
.profile-page {
  max-width: 1380px;
  margin: 0 auto;
}
.profile-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 22px;
  align-items: stretch;
}
.profile-grid > * {
  min-width: 0;
}

/* Bento Card Base & Neomorphic Depth */
.profile-page .bento-card {
  background: linear-gradient(160deg, #ffffff 0%, #f9fbff 100%);
  border: 1px solid rgba(225, 233, 248, 0.9);
  border-radius: 22px;
  padding: 26px 28px;
  box-shadow:
    0 10px 28px -5px rgba(138, 154, 188, 0.12),
    0 3px 8px -2px rgba(138, 154, 188, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  position: relative;
  display: flex;
  flex-direction: column;
}

/* Card Spans */
.profile-hero {
  grid-column: span 7;
  justify-content: space-between;
  gap: 18px;
}
.profile-panel--basic {
  grid-column: span 5;
}
.profile-panel--personal {
  grid-column: span 5;
}
.profile-panel--journey {
  grid-column: span 7;
}
.profile-panel--emergency,
.profile-editor {
  grid-column: 1 / -1;
}
.profile-listen {
  grid-column: span 4;
}
.profile-connect {
  grid-column: span 8;
}
.profile-connect--full {
  grid-column: 1 / -1;
}

/* Section Headings */
.profile-card-heading {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}
.profile-card-heading__icon {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #edf1fe;
  color: #5063cb;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(80, 99, 203, 0.14);
}
.profile-card-heading__icon--mint {
  background: #edfbf4;
  color: #1a9657;
  box-shadow: 0 2px 8px rgba(26, 150, 87, 0.14);
}
.profile-card-heading__icon--gold {
  background: #fff8eb;
  color: #d98218;
  box-shadow: 0 2px 8px rgba(217, 130, 24, 0.14);
}
.profile-card-heading__icon--coral {
  background: #fdf0f0;
  color: #d64a57;
  box-shadow: 0 2px 8px rgba(214, 74, 87, 0.14);
}
.profile-card-heading__icon--blue {
  background: #eef6fc;
  color: #2980b9;
  box-shadow: 0 2px 8px rgba(41, 128, 185, 0.14);
}
.profile-card-heading .eyebrow {
  margin: 0 0 4px;
  color: #6375dd;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.profile-card-heading h2 {
  margin: 0;
  color: #1e2944;
  font-family: "Plus Jakarta Sans", sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.2;
}

/* Individual Information Item (Subtle Bluish-Tinted Box) */
.profile-info-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0;
}
.profile-info-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 11px 16px;
  border-radius: 12px;
  background: rgba(240, 244, 255, 0.75);
  border: 1px solid rgba(218, 228, 250, 0.85);
  box-shadow:
    0 1px 3px rgba(130, 155, 205, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.85);
  transition: all 0.2s ease;
  min-height: 44px;
  text-decoration: none;
  color: inherit;
}
.profile-info-item:hover {
  background: rgba(235, 242, 255, 0.95);
  border-color: rgba(198, 215, 247, 0.95);
  box-shadow:
    0 4px 10px rgba(120, 145, 195, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
}
.profile-info-item__label {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
  flex-shrink: 0;
}
.profile-info-item__icon {
  color: #5569cd;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.profile-info-item dt {
  margin: 0;
  color: #5e6f91;
  font-size: 0.83rem;
  font-weight: 600;
  white-space: nowrap;
}
.profile-info-item dd,
.profile-info-item__value {
  margin: 0;
  color: #1e2944;
  font-size: 0.88rem;
  font-weight: 700;
  text-align: right;
  word-break: break-word;
  min-width: 0;
}

/* Hero Section */
.profile-hero__identity {
  display: flex;
  align-items: center;
  gap: 24px;
}
.profile-hero__avatar-wrap {
  position: relative;
  flex: 0 0 130px;
  width: 130px;
  height: 130px;
}
.profile-hero__avatar-wrap img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 5px solid #ffffff;
  box-shadow:
    0 10px 24px -4px rgba(80, 99, 203, 0.22),
    0 2px 6px rgba(0, 0, 0, 0.06);
}
.profile-hero__meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.profile-hero__meta .eyebrow {
  margin: 0 0 2px;
}
.profile-hero__meta h2 {
  margin: 0;
  color: #1a2540;
  font-family: "Plus Jakarta Sans", sans-serif;
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.15;
}
.profile-hero__dept {
  margin: 2px 0 6px;
  color: #556481;
  font-size: 0.96rem;
  font-weight: 600;
}
.profile-hero__badges {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.profile-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1.3;
}
.profile-badge--semester {
  background: #eef2ff;
  color: #4355b9;
  border: 1px solid #dbe4fd;
}
.profile-badge--status {
  background: #f0fbf4;
  color: #197843;
  border: 1px solid #c3edd2;
  transition: all 0.2s ease;
}
.profile-badge__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.25);
  transition: all 0.2s ease;
}
.profile-hero__bio {
  margin: 16px 0 0;
  padding: 0;
  background: transparent;
  border: none;
  box-shadow: none;
  font-style: italic;
  font-size: 0.96rem;
  line-height: 1.6;
  color: #4b5a79;
}

/* Academic Journey */
.profile-journey-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.profile-journey-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.65);
  border: 1px solid rgba(228, 235, 248, 0.85);
  border-radius: 14px;
}
.profile-journey-item__stage {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.88rem;
  font-weight: 700;
  color: #273452;
}
.profile-timeline__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #c3cfeb;
  border: 2px solid #ffffff;
  box-shadow: 0 0 0 2px #d5e0f5;
  flex-shrink: 0;
}
.profile-timeline__dot--current {
  background: #4f62cc;
  box-shadow: 0 0 0 3px rgba(79, 98, 204, 0.25);
}
.profile-journey-item__content {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 10px;
}

/* Emergency Contacts - Single Horizontal Line per Contact with subtle elliptical pills */
.profile-emergency-contacts {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.profile-emergency-row {
  display: grid;
  grid-template-columns: 88px 1.4fr 1.1fr 1.1fr;
  align-items: center;
  gap: 12px;
  padding: 8px 14px;
  border-radius: 16px;
  background: rgba(246, 248, 254, 0.55);
  border: 1px solid rgba(230, 236, 248, 0.65);
}
.profile-emergency-badge {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #cf4856;
  background: #fdf0f0;
  padding: 4px 10px;
  border-radius: 999px;
  text-align: center;
  white-space: nowrap;
  border: 1px solid #f9d8db;
}
.profile-emergency-field {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 5px 14px;
  border-radius: 999px;
  background: rgba(238, 244, 255, 0.75);
  border: 1px solid rgba(220, 230, 250, 0.8);
  box-shadow: 0 1px 2px rgba(135, 160, 210, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.85);
}
.profile-emergency-field dt {
  margin: 0;
  color: #6a7c9f;
  font-size: 0.74rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
}
.profile-emergency-field dd {
  margin: 0;
  color: #1e2944;
  font-size: 0.86rem;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Connect / Social Links with Recognizable Icons */
.profile-social-icons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}
.profile-social-icon-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px;
  border-radius: 14px;
  background: rgba(241, 245, 254, 0.85);
  border: 1px solid rgba(216, 228, 249, 0.85);
  box-shadow:
    0 2px 5px rgba(130, 155, 205, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  text-decoration: none;
  color: #24324f;
  font-size: 0.88rem;
  font-weight: 700;
  transition: all 0.2s ease;
}
.profile-social-icon-btn:hover {
  transform: translateY(-2px);
  background: #ffffff;
  border-color: rgba(195, 212, 246, 0.95);
  box-shadow: 0 6px 16px rgba(110, 135, 185, 0.16);
  color: #1e2944;
}
.profile-social-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}
.profile-social-icon-btn:hover .profile-social-icon-wrap {
  transform: scale(1.12);
}
.profile-empty-text {
  margin: 0;
  color: #8391ab;
  font-size: 0.88rem;
  font-style: italic;
}

/* Listen With Me (Spotify) */
.profile-listen {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 18px;
  min-height: 160px;
  color: inherit;
  text-decoration: none;
  border: 1px solid rgba(225, 233, 248, 0.9);
  border-radius: 22px;
  background: linear-gradient(150deg, #ffffff 0%, #f4f7fd 100%);
  padding: 26px 28px;
  box-shadow:
    0 10px 28px -5px rgba(138, 154, 188, 0.12),
    0 3px 8px -2px rgba(138, 154, 188, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}
.profile-listen:hover {
  transform: translateY(-2px);
  box-shadow:
    0 14px 34px -5px rgba(115, 138, 188, 0.18),
    0 4px 12px -2px rgba(115, 138, 188, 0.08);
  border-color: rgba(195, 212, 246, 0.95);
}
.profile-listen__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.profile-listen__icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #edfcf1;
  color: #1db954;
  box-shadow: 0 2px 8px rgba(29, 185, 84, 0.18);
}
.profile-listen h2 {
  margin: 2px 0 4px;
  color: #1e2944;
  font-family: "Plus Jakarta Sans", sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.03em;
}
.profile-listen__desc {
  margin: 0;
  color: #63728f;
  font-size: 0.88rem;
  font-weight: 500;
}

/* Actions & Buttons */
.profile-actions {
  display: flex;
  justify-content: flex-end;
  margin: -10px 0 16px;
}
.profile-button,
.profile-text-button {
  border: 0;
  border-radius: 12px;
  background: #35415e;
  color: #ffffff;
  padding: 10px 20px;
  font: inherit;
  font-size: 0.86rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(53, 65, 94, 0.15);
}
.profile-button:hover:not(:disabled),
.profile-text-button:hover:not(:disabled) {
  background: #252e43;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(53, 65, 94, 0.22);
}
.profile-button:disabled {
  opacity: 0.65;
  cursor: wait;
}
.secondary,
.profile-text-button {
  background: #eef2f9;
  color: #35415e;
  box-shadow: none;
}
.secondary:hover,
.profile-text-button:hover {
  background: #e2e8f4;
  box-shadow: 0 2px 8px rgba(140, 160, 200, 0.12);
}

/* Editor Form Styling */
.profile-editor__heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}
.profile-editor__heading h2 {
  margin: 0;
  font-family: "Plus Jakarta Sans", sans-serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: #1e2944;
}
.profile-form {
  display: grid;
  gap: 18px;
  margin-top: 16px;
}
.profile-form fieldset {
  border: 1px solid #e2e8f4;
  border-radius: 16px;
  padding: 16px 18px;
  margin: 0;
  background: rgba(255, 255, 255, 0.5);
}
.profile-form legend {
  color: #2b3754;
  font-weight: 800;
  font-size: 0.92rem;
  padding: 0 8px;
}
.profile-form__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 8px;
}
.profile-form label {
  color: #556481;
  display: grid;
  gap: 6px;
  font-size: 0.83rem;
  font-weight: 700;
}
.profile-form input,
.profile-form select,
.profile-form textarea {
  border: 1px solid #d7e0ee;
  border-radius: 10px;
  padding: 10px 12px;
  background: #ffffff;
  color: #263350;
  font: inherit;
  font-size: 0.86rem;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}
.profile-form input:focus,
.profile-form select:focus,
.profile-form textarea:focus {
  outline: none;
  border-color: #5468d4;
  box-shadow: 0 0 0 3px rgba(84, 104, 212, 0.15);
}
.profile-form textarea {
  min-height: 80px;
  resize: vertical;
}
.profile-picture-input {
  display: flex;
  align-items: center;
  gap: 18px;
}
.profile-picture-input img {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #ffffff;
  box-shadow: 0 4px 12px rgba(80, 99, 203, 0.16);
}
.profile-picture-input input {
  padding: 6px;
}
.profile-picture-input small {
  font-weight: 400;
  color: #7b8aa6;
}
.wide {
  grid-column: 1 / -1;
}
.journey {
  margin-top: 8px;
}
.profile-contact {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr)) auto;
  gap: 10px;
  margin: 10px 0;
  align-items: center;
}
.profile-error {
  color: #b42318;
  font-weight: 700;
  margin: 0;
}

/* Responsive Media Queries */
@media (max-width: 960px) {
  .profile-hero {
    grid-column: 1 / -1;
  }
  .profile-panel--basic,
  .profile-panel--personal {
    grid-column: span 6;
  }
  .profile-panel--journey {
    grid-column: 1 / -1;
  }
  .profile-listen {
    grid-column: span 5;
  }
  .profile-connect {
    grid-column: span 7;
  }
}

@media (max-width: 768px) {
  .profile-emergency-row {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 12px 14px;
  }
}

@media (max-width: 680px) {
  .profile-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .profile-page .bento-card {
    padding: 20px 18px;
  }
  .profile-hero,
  .profile-panel--basic,
  .profile-panel--personal,
  .profile-panel--journey,
  .profile-panel--emergency,
  .profile-listen,
  .profile-connect {
    grid-column: 1 / -1;
  }
  .profile-hero__avatar-wrap {
    flex: 0 0 108px;
    width: 108px;
    height: 108px;
  }
  .profile-hero__identity {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  .profile-hero__meta {
    align-items: center;
  }
  .profile-hero__badges {
    justify-content: center;
  }
  .profile-journey-item__content {
    grid-template-columns: 1fr;
  }
  .profile-form__grid,
  .profile-contact,
  .profile-emergency-contacts,
  .profile-social-icons {
    grid-template-columns: 1fr;
  }
  .profile-info-item {
    padding: 10px 14px;
  }
}
`;

export function ProfilePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const response = await fetch(`${apiUrl}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        if (!response.ok)
          throw new Error(result.message || "Unable to load your profile.");
        if (mounted) {
          setUser(result.user);
          setEditing(!result.user.profileCompleted);
        }
      } catch (e) {
        if (mounted) setError(e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [token]);
  const save = async (profile, avatarFile) => {
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`${apiUrl}/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ profile }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Unable to save your profile.");
      let updatedUser = result.user;
      if (avatarFile) {
        const image = new FormData();
        image.append("avatar", avatarFile);
        const avatarResponse = await fetch(`${apiUrl}/api/profile/avatar`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: image,
        });
        const avatarResult = await avatarResponse.json();
        if (!avatarResponse.ok)
          throw new Error(
            avatarResult.message || "Unable to upload your profile picture.",
          );
        updatedUser = avatarResult.user;
      }
      const wasSetup = !user.profileCompleted;
      setUser(updatedUser);
      setEditing(false);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.dispatchEvent(
        new CustomEvent("unify-profile-updated", { detail: updatedUser }),
      );
      if (wasSetup) navigate("/dashboard", { replace: true });
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };
  if (loading)
    return (
      <section className="page">
        <p>Loading your profile…</p>
      </section>
    );
  if (!user)
    return (
      <section className="page">
        <p className="profile-error">
          {error || "Unable to load your profile."}
        </p>
      </section>
    );
  const p = asForm(user.profile);
  const basic = [
    ["Student ID", p.studentId],
    ["Department", p.department],
    ["Program", p.program],
    ["Semester", p.semester],
    ["Batch", p.batch],
    ["University Email", p.universityEmail],
  ];
  const personal = [
    ["Phone Number", p.phone, Phone],
    [
      "Date of Birth",
      p.dateOfBirth ? formatDate(p.dateOfBirth) : "Not provided",
      CalendarDays,
    ],
    ["Gender", p.gender, UserRound],
    ["Blood Group", p.bloodGroup, Droplets],
    ["Address", p.address, MapPin],
  ];
  const links = [
    ["GitHub", p.socialLinks.github],
    ["Instagram", p.socialLinks.instagram],
    ["LinkedIn", p.socialLinks.linkedin],
    ["Facebook", p.socialLinks.facebook],
  ].filter(([, url]) => url);
  return (
    <section className="page profile-page">
      <style>{styles}</style>
      <PageHeader
        eyebrow="Student identity"
        title="Profile"
        description="A quick view of your university life, journey, and the things that make you you."
      />
      {!editing && (
        <div className="profile-actions">
          <button className="profile-button" onClick={() => setEditing(true)}>
            Edit profile
          </button>
        </div>
      )}
      <BentoGrid className="profile-grid">
        {editing ? (
          <Editor
            initial={p}
            setup={!user.profileCompleted}
            saving={saving}
            error={error}
            onSave={save}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <>
            <BentoCard className="profile-hero">
              <div className="profile-hero__identity">
                <div className="profile-hero__avatar-wrap">
                  <img
                    src={p.avatarUrl || profilePicture}
                    alt={`${value(p.name)} profile picture`}
                  />
                </div>
                <div className="profile-hero__meta">
                  <p className="eyebrow">Student profile</p>
                  <h2>{value(p.name)}</h2>
                  <p className="profile-hero__dept">{value(p.department)}</p>
                  <div className="profile-hero__badges">
                    <span className="profile-badge profile-badge--semester">
                      {value(p.semester)}
                    </span>
                    {p.status && (() => {
                      const sInfo = getStatusInfo(p.status);
                      return (
                        <span
                          className="profile-badge profile-badge--status"
                          style={{
                            backgroundColor: sInfo.bg,
                            color: sInfo.text,
                            borderColor: sInfo.border,
                          }}
                        >
                          <span
                            className="profile-badge__dot"
                            style={{
                              backgroundColor: sInfo.dot,
                              boxShadow: `0 0 0 2px ${sInfo.border}`,
                            }}
                          />
                          <span className="profile-badge__emoji">
                            {sInfo.emoji}
                          </span>
                          <span>{sInfo.label}</span>
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>
              {p.bio && (
                <p className="profile-hero__bio">
                  “{p.bio}”
                </p>
              )}
            </BentoCard>
            <BentoCard className="profile-panel profile-panel--basic">
              <div className="profile-card-heading">
                <span className="profile-card-heading__icon">
                  <School size={18} />
                </span>
                <div>
                  <p className="eyebrow">The essentials</p>
                  <h2>Basic information</h2>
                </div>
              </div>
              <InfoList items={basic} />
            </BentoCard>
            <BentoCard className="profile-panel profile-panel--personal">
              <div className="profile-card-heading">
                <span className="profile-card-heading__icon profile-card-heading__icon--mint">
                  <UserRound size={18} />
                </span>
                <div>
                  <p className="eyebrow">A little more</p>
                  <h2>Personal information</h2>
                </div>
              </div>
              <InfoList items={personal} icons />
            </BentoCard>
            <BentoCard className="profile-panel profile-panel--journey">
              <div className="profile-card-heading">
                <span className="profile-card-heading__icon profile-card-heading__icon--gold">
                  <GraduationCap size={18} />
                </span>
                <div>
                  <p className="eyebrow">The road so far</p>
                  <h2>Academic journey</h2>
                </div>
              </div>
              <div className="profile-journey-list">
                {["school", "college", "university"].map((stage) => (
                  <div className="profile-journey-item" key={stage}>
                    <div className="profile-journey-item__stage">
                      <span
                        className={`profile-timeline__dot ${stage === "university" ? "profile-timeline__dot--current" : ""}`}
                      />
                      <span>{stage[0].toUpperCase() + stage.slice(1)}</span>
                    </div>
                    <div className="profile-journey-item__content">
                      <div className="profile-info-item">
                        <dt>Institution</dt>
                        <dd className="profile-info-item__value">
                          {value(p.academicJourney[stage].institution)}
                        </dd>
                      </div>
                      <div className="profile-info-item">
                        <dt>Years</dt>
                        <dd className="profile-info-item__value">
                          {value(p.academicJourney[stage].years)}
                        </dd>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>
            <BentoCard className="profile-panel profile-panel--emergency">
              <div className="profile-card-heading">
                <span className="profile-card-heading__icon profile-card-heading__icon--coral">
                  <Phone size={18} />
                </span>
                <div>
                  <p className="eyebrow">There when it matters</p>
                  <h2>Emergency contact</h2>
                </div>
              </div>
              <div className="profile-emergency-contacts">
                {p.emergencyContacts.length ? (
                  p.emergencyContacts.map((contact, index) => (
                    <div
                      className="profile-emergency-row"
                      key={`${contact.name}-${index}`}
                    >
                      <span className="profile-emergency-badge">
                        Contact {index + 1}
                      </span>
                      <div className="profile-emergency-field">
                        <dt>Name</dt>
                        <dd>{value(contact.name)}</dd>
                      </div>
                      <div className="profile-emergency-field">
                        <dt>Relationship</dt>
                        <dd>{value(contact.relationship)}</dd>
                      </div>
                      <div className="profile-emergency-field">
                        <dt>Phone</dt>
                        <dd>{value(contact.phone)}</dd>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="profile-empty-text">Not provided</p>
                )}
              </div>
            </BentoCard>
            {p.socialLinks.spotify && (
              <a
                className="profile-listen"
                href={p.socialLinks.spotify}
                target="_blank"
                rel="noreferrer"
              >
                <div className="profile-listen__header">
                  <span className="profile-listen__icon">
                    <Music2 size={22} />
                  </span>
                  <span className="profile-social-arrow">↗</span>
                </div>
                <div>
                  <p className="eyebrow">A little soundtrack</p>
                  <h2>Listen With Me</h2>
                  <p className="profile-listen__desc">What I’m listening to lately</p>
                </div>
              </a>
            )}
            <BentoCard
              className={`profile-connect ${!p.socialLinks.spotify ? "profile-connect--full" : ""}`}
            >
              <div className="profile-card-heading">
                <span className="profile-card-heading__icon profile-card-heading__icon--blue">
                  <span>↗</span>
                </span>
                <div>
                  <p className="eyebrow">Find me around</p>
                  <h2>Connect</h2>
                </div>
              </div>
              {(() => {
                const activeSocials = SOCIAL_CONFIG.filter(
                  ({ key }) => p.socialLinks && p.socialLinks[key],
                );
                if (!activeSocials.length) {
                  return <p className="profile-empty-text">Not provided</p>;
                }
                return (
                  <div className="profile-social-icons">
                    {activeSocials.map(({ key, label, Icon, color }) => (
                      <a
                        key={key}
                        className="profile-social-icon-btn"
                        href={p.socialLinks[key]}
                        target="_blank"
                        rel="noreferrer"
                        title={label}
                        aria-label={label}
                      >
                        <span
                          className="profile-social-icon-wrap"
                          style={{ color }}
                        >
                          <Icon size={20} />
                        </span>
                        <span className="profile-social-name">{label}</span>
                      </a>
                    ))}
                  </div>
                );
              })()}
            </BentoCard>
          </>
        )}
      </BentoGrid>
    </section>
  );
}
export default ProfilePage;
