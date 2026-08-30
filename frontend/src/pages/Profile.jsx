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

const profileDetails = [
  ["Student ID", "CSE-22-041"],
  ["Department", "Computer Science & Engineering"],
  ["Program", "B.Sc. in Engineering"],
  ["Semester", "4th Semester"],
  ["Batch", "2022–2026"],
  ["University Email", "jayed.raihan@unify.edu"],
];
const personalDetails = [
  ["Phone Number", "+880 1712 345 678", Phone],
  ["Date of Birth", "14 February 2003", CalendarDays],
  ["Gender", "Male", UserRound],
  ["Blood Group", "O+", Droplets],
  ["Address", "Dhanmondi, Dhaka", MapPin],
];
const emergencyContacts = [
  ["B.M. Adnan Saleh", "Father", "+880 1812 987 654"],
  ["Khalif, Farhana Saleh", "Mother", "+880 1712 345 678"],
];
const socialLinks = [
  [
    "GitHub",
    "https://github.com/jayedraihan",
    "https://img.icons8.com/?size=48&id=12599&format=png",
  ],
  [
    "Instagram",
    "https://www.instagram.com/",
    "https://img.icons8.com/?size=48&id=32292&format=png",
  ],
  [
    "LinkedIn",
    "https://www.linkedin.com/",
    "https://img.icons8.com/?size=48&id=13930&format=png",
  ],
  [
    "Facebook",
    "https://www.facebook.com/",
    "https://img.icons8.com/?size=48&id=118497&format=png",
  ],
];

function ProfileInfoList({ items, withIcons = false }) {
  return (
    <dl className="profile-info-list">
      {items.map(([label, value, Icon]) => (
        <div className="profile-info-list__item" key={label}>
          {withIcons && Icon && <Icon size={16} aria-hidden="true" />}
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

const profileInlineStyles = `
.profile-grid { grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 18px; }
.profile-page { font-family: "Plus Jakarta Sans", "DM Sans", sans-serif; }
.profile-grid > * { min-width: 0; }
.profile-hero { grid-column: span 7; min-height: 265px; overflow: hidden; }
.profile-hero__identity { display: flex; align-items: center; gap: 22px; }
.profile-hero__identity img { width: 112px; height: 112px; flex: 0 0 112px; border: 5px solid #fff; border-radius: 50%; object-fit: cover; }
.profile-panel--basic { grid-column: span 5; }
.profile-panel--personal { grid-column: span 5; }
.profile-panel--journey { grid-column: span 7; }
.profile-panel--emergency { grid-column: 1 / -1; }
.profile-listen { grid-column: span 3; display: flex; min-height: 148px; color: inherit; text-decoration: none; border: 1px solid rgba(255, 255, 255, 0.75); border-radius: 20px; background: #f9faff; box-shadow: 8px 8px 20px rgba(164, 175, 201, 0.18), -6px -6px 16px rgba(255, 255, 255, 0.92); transition: transform 0.22s ease, box-shadow 0.22s ease; }
.profile-listen:hover { transform: translateY(-4px); box-shadow: 10px 12px 22px rgba(164, 175, 201, 0.22), -6px -6px 16px rgba(255, 255, 255, 0.95); }
.profile-panel--personal .profile-info-list { gap: 8px; }
.profile-panel--personal .profile-info-list__item { padding: 9px 10px; border: 1px solid #edf0f6; border-radius: 11px; background: rgba(255, 255, 255, 0.48); }
.profile-emergency-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.profile-emergency-contacts { display: grid; gap: 14px; }
.profile-emergency-grid > div { display: grid; gap: 5px; padding: 10px 12px; border-left: 2px solid #f0c9ca; }
.profile-emergency-grid dt { color: #929bad; font-size: 0.68rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
.profile-emergency-grid dd { margin: 0; color: #35415e; font-size: 0.84rem; font-weight: 700; }
.profile-connect { grid-column: span 9; min-height: 148px; }
.profile-social-links { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
.profile-social-links img { width: 20px; height: 20px; flex: 0 0 20px; object-fit: contain; display: block; }
@media (max-width: 900px) { .profile-hero { grid-column: 1 / -1; } .profile-panel--basic, .profile-panel--personal, .profile-panel--journey { grid-column: span 6; } .profile-listen { grid-column: span 4; } .profile-connect { grid-column: span 8; } }
@media (max-width: 680px) { .profile-grid { grid-template-columns: 1fr; } .profile-hero, .profile-panel--basic, .profile-panel--personal, .profile-panel--journey, .profile-panel--emergency, .profile-listen, .profile-connect { grid-column: 1 / -1; } .profile-hero__identity img { width: 88px; height: 88px; flex-basis: 88px; } .profile-social-links, .profile-emergency-grid { grid-template-columns: 1fr; } }
`;

export function ProfilePage() {
  return (
    <section className="page profile-page">
      <style>{profileInlineStyles}</style>
      <PageHeader
        eyebrow="Student identity"
        title="Profile"
        description="A quick view of your university life, journey, and the things that make you you."
      />
      <BentoGrid className="profile-grid">
        <BentoCard className="profile-hero">
          <div className="profile-hero__identity">
            <img src={profilePicture} alt="Jayed Raihan" />
            <div>
              <p className="eyebrow">Student profile</p>
              <h2>Jayed Raihan123</h2>
              <p>Computer Science &amp; Engineering</p>
              <span>4th Semester</span>
            </div>
          </div>
          <p className="profile-hero__bio">
            “Building things, breaking things, and learning along the way.”
          </p>
          <div className="profile-hero__tag">
            <span /> Open to new ideas
          </div>
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
          <ProfileInfoList items={profileDetails} />
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
          <ProfileInfoList items={personalDetails} withIcons />
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
            <div>
              <span className="profile-timeline__dot" />
              <div>
                <strong>School</strong>
                <p>Dhaka Residential Model College</p>
                <small>2010 – 2019</small>
              </div>
            </div>
            <div>
              <span className="profile-timeline__dot" />
              <div>
                <strong>College</strong>
                <p>Notre Dame College, Dhaka</p>
                <small>2019 – 2021</small>
              </div>
            </div>
            <div>
              <span className="profile-timeline__dot profile-timeline__dot--current" />
              <div>
                <strong>University</strong>
                <p>AUST University</p>
                <small>2022 – Present</small>
              </div>
            </div>
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
            {emergencyContacts.map(([name, relationship, phone]) => (
              <dl className="profile-emergency-grid" key={name}>
                <div>
                  <dt>Name</dt>
                  <dd>{name}</dd>
                </div>
                <div>
                  <dt>Relationship</dt>
                  <dd>{relationship}</dd>
                </div>
                <div>
                  <dt>Phone Number</dt>
                  <dd>{phone}</dd>
                </div>
              </dl>
            ))}
          </div>
        </BentoCard>
        <a
          className="profile-listen"
          href="https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M"
          target="_blank"
          rel="noreferrer"
        >
          <span className="profile-listen__icon">
            <Music2 size={23} />
          </span>
          <div>
            <p className="eyebrow">A little soundtrack</p>
            <h2>Listen With Me</h2>
            <p>
              What I’m listening to lately <span aria-hidden="true">→</span>
            </p>
          </div>
        </a>
        <BentoCard className="profile-connect">
          <div className="profile-card-heading">
            <span className="profile-card-heading__icon profile-card-heading__icon--blue">
              <span aria-hidden="true">↗</span>
            </span>
            <div>
              <p className="eyebrow">Find me around</p>
              <h2>Connect</h2>
            </div>
          </div>
          <div className="profile-social-links">
            {socialLinks.map(([label, href, iconUrl]) => (
              <a href={href} key={label} target="_blank" rel="noreferrer">
                <img src={iconUrl} alt="" />
                <span>{label}</span>
                <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </BentoCard>
      </BentoGrid>
    </section>
  );
}

export default ProfilePage;
