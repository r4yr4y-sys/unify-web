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

function InfoList({ items, icons = false }) {
  return (
    <dl className="profile-info-list">
      {items.map(([label, item, Icon]) => (
        <div className="profile-info-list__item" key={label}>
          {icons && Icon && <Icon size={16} />}
          <dt>{label}</dt>
          <dd>{value(item)}</dd>
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
              <input
                placeholder="e.g. Open to new ideas"
                {...field("status")}
              />
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
              <input {...field("gender")} />
            </label>
            <label>
              Blood group
              <input {...field("bloodGroup")} />
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
.profile-grid{grid-template-columns:repeat(12,minmax(0,1fr));gap:18px}.profile-grid>*{min-width:0}.profile-hero{grid-column:span 7;min-height:265px}.profile-hero__identity{display:flex;align-items:center;gap:22px}.profile-hero__identity img{width:112px;height:112px;flex:0 0 112px;border:5px solid #fff;border-radius:50%;object-fit:cover}.profile-panel--basic,.profile-panel--personal{grid-column:span 5}.profile-panel--journey{grid-column:span 7}.profile-panel--emergency,.profile-editor{grid-column:1/-1}.profile-connect{grid-column:span 9;min-height:148px}.profile-listen{grid-column:span 3;display:flex;min-height:148px;color:inherit;text-decoration:none;border:1px solid rgba(255,255,255,.75);border-radius:20px;background:#f9faff}.profile-panel--personal .profile-info-list{gap:8px}.profile-panel--personal .profile-info-list__item{padding:9px 10px;border:1px solid #edf0f6;border-radius:11px}.profile-emergency-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.profile-emergency-contacts{display:grid;gap:14px}.profile-emergency-grid>div{display:grid;gap:5px;padding:10px 12px;border-left:2px solid #f0c9ca}.profile-emergency-grid dt{color:#929bad;font-size:.68rem;font-weight:700;text-transform:uppercase}.profile-emergency-grid dd{margin:0;color:#35415e;font-size:.84rem;font-weight:700}.profile-social-links{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.profile-actions{display:flex;justify-content:flex-end;margin:-8px 0 14px}.profile-button,.profile-text-button{border:0;border-radius:10px;background:#35415e;color:#fff;padding:10px 16px;font:inherit;font-weight:700;cursor:pointer}.profile-button:disabled{opacity:.65;cursor:wait}.secondary,.profile-text-button{background:#eef1f7;color:#35415e}.profile-editor__heading{display:flex;justify-content:space-between;gap:12px}.profile-form{display:grid;gap:18px}.profile-form fieldset{border:1px solid #e6eaf1;border-radius:14px;padding:14px;margin:0}.profile-form legend{color:#35415e;font-weight:800;padding:0 6px}.profile-form__grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:10px}.profile-form label{color:#58647c;display:grid;gap:6px;font-size:.84rem;font-weight:700}.profile-form input,.profile-form textarea{border:1px solid #dce2ec;border-radius:9px;padding:9px 10px;background:#fff;color:#35415e;font:inherit}.profile-form textarea{min-height:75px;resize:vertical}.profile-picture-input{display:flex;align-items:center;gap:14px}.profile-picture-input img{width:76px;height:76px;border-radius:50%;object-fit:cover}.profile-picture-input input{padding:6px}.profile-picture-input small{font-weight:400}.wide{grid-column:1/-1}.journey{margin-top:8px}.profile-contact{display:grid;grid-template-columns:repeat(3,minmax(0,1fr)) auto;gap:8px;margin:10px 0}.profile-error{color:#b42318;font-weight:700;margin:0}@media(max-width:900px){.profile-hero{grid-column:1/-1}.profile-panel--basic,.profile-panel--personal,.profile-panel--journey{grid-column:span 6}.profile-listen{grid-column:span 4}.profile-connect{grid-column:span 8}}@media(max-width:680px){.profile-grid{grid-template-columns:1fr}.profile-hero,.profile-panel--basic,.profile-panel--personal,.profile-panel--journey,.profile-panel--emergency,.profile-listen,.profile-connect{grid-column:1/-1}.profile-form__grid,.profile-contact,.profile-emergency-grid,.profile-social-links{grid-template-columns:1fr}}
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
    ["Date of Birth", p.dateOfBirth, CalendarDays],
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
                <img
                  src={p.avatarUrl || profilePicture}
                  alt={`${value(p.name)} profile picture`}
                />
                <div>
                  <p className="eyebrow">Student profile</p>
                  <h2>{value(p.name)}</h2>
                  <p>{value(p.department)}</p>
                  <span>{value(p.semester)}</span>
                </div>
              </div>
              <p className="profile-hero__bio">{value(p.bio)}</p>
              <div className="profile-hero__tag">{value(p.status)}</div>
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
              <div className="profile-timeline">
                {["school", "college", "university"].map((stage) => (
                  <div key={stage}>
                    <span
                      className={`profile-timeline__dot ${stage === "university" ? "profile-timeline__dot--current" : ""}`}
                    />
                    <div>
                      <strong>{stage[0].toUpperCase() + stage.slice(1)}</strong>
                      <p>{value(p.academicJourney[stage].institution)}</p>
                      <small>{value(p.academicJourney[stage].years)}</small>
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
                    <dl
                      className="profile-emergency-grid"
                      key={`${contact.name}-${index}`}
                    >
                      <div>
                        <dt>Name</dt>
                        <dd>{value(contact.name)}</dd>
                      </div>
                      <div>
                        <dt>Relationship</dt>
                        <dd>{value(contact.relationship)}</dd>
                      </div>
                      <div>
                        <dt>Phone Number</dt>
                        <dd>{value(contact.phone)}</dd>
                      </div>
                    </dl>
                  ))
                ) : (
                  <p>Not provided</p>
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
                <span className="profile-listen__icon">
                  <Music2 size={23} />
                </span>
                <div>
                  <p className="eyebrow">A little soundtrack</p>
                  <h2>Listen With Me</h2>
                  <p>What I’m listening to lately →</p>
                </div>
              </a>
            )}
            <BentoCard className="profile-connect">
              <div className="profile-card-heading">
                <span className="profile-card-heading__icon profile-card-heading__icon--blue">
                  <span>↗</span>
                </span>
                <div>
                  <p className="eyebrow">Find me around</p>
                  <h2>Connect</h2>
                </div>
              </div>
              {links.length ? (
                <div className="profile-social-links">
                  {links.map(([label, url]) => (
                    <a href={url} key={label} target="_blank" rel="noreferrer">
                      <span>{label}</span>
                      <span>↗</span>
                    </a>
                  ))}
                </div>
              ) : (
                <p>Not provided</p>
              )}
            </BentoCard>
          </>
        )}
      </BentoGrid>
    </section>
  );
}
export default ProfilePage;
