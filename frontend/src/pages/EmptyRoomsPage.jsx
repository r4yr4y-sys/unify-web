import { useEffect, useState } from "react";
import { Clock3, DoorOpen, FlaskConical, Search, X } from "lucide-react";
import { Button, PageHeader } from "../components/ui";
import {
  findEmptyRooms,
  formatRemainingTime,
  formatTime,
  getDayAndTime,
  getSearchAvailability,
} from "../utils/emptyRooms";

// ===== BETA MANUAL TESTING CONFIGURATION =====
// Change these two values to test any supported day and time before clicking Search.
const EMPTY_ROOM_TEST_MODE = false;
const TEST_DAY = "Tuesday"; // Supported values: Sunday, Monday, Tuesday, Wednesday, Thursday, Friday
const TEST_TIME = "10:32";
// =============================================

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

function getSearchMoment() {
  return EMPTY_ROOM_TEST_MODE
    ? { day: TEST_DAY, time: TEST_TIME }
    : getDayAndTime();
}

function NoRoomsModal({ gender, onClose }) {
  const isFemale = String(gender).toLowerCase() === "female";
  const suggestions = isFemale
    ? [
        "Female Common Room on the Ground Floor",
        "Female Common Room on the 5th Floor",
        "Canteen",
        "Plaza",
        "Sitting outside the lab (Peak University Experience)",
      ]
    : [
        "Plaza",
        "Canteen",
        "Sitting outside the lab (Peak University Experience)",
      ];
  return (
    <div
      className="empty-rooms-modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <section
        className="empty-rooms-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="no-rooms-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="empty-rooms-modal__close"
          onClick={onClose}
          aria-label="Close suggestions"
        >
          <X size={18} />
        </button>
        <span className="empty-rooms-modal__emoji">😵‍💫</span>
        <h2 id="no-rooms-title">Every room is busy right now.</h2>
        <p>Plan B: find a comfortable corner and keep the vibe alive.</p>
        <ul>
          {suggestions.map((suggestion) => (
            <li key={suggestion}>{suggestion}</li>
          ))}
        </ul>
        <Button type="button" onClick={onClose}>
          I&apos;ll survive
        </Button>
      </section>
    </div>
  );
}

export default function EmptyRoomsPage() {
  const [result, setResult] = useState(null);
  const [showNoRooms, setShowNoRooms] = useState(false);
  const [gender, setGender] = useState("");
  const [roomsData, setRoomsData] = useState([]);

  useEffect(() => {
    let active = true;
    fetch(`${apiUrl}/api/empty-rooms`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to load room listings.");
        const addedRooms = (data.rooms || []).map((room) => ({
          room: room.room,
          type: room.type,
          empty: (room.availability || []).reduce((schedule, slot) => {
            schedule[slot.day] ||= [];
            schedule[slot.day].push([slot.start, slot.end]);
            return schedule;
          }, {}),
        }));
        if (active) setRoomsData(addedRooms);
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const loadGender = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${apiUrl}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      console.log("PROFILE RESPONSE:", data);
      console.log("GENDER:", data.user?.profile?.gender);

      setGender(data.user?.profile?.gender || "");
    } catch {
      setGender("");
    }
  };

  const searchRooms = async () => {
    const { day, time } = getSearchMoment();
    const availability = getSearchAvailability(day, time);
    if (availability !== "available") {
      setResult({ day, time, availability, rooms: [] });
      return;
    }
    const rooms = findEmptyRooms(roomsData, day, time);
    setResult({ day, time, availability, rooms, roomCount: roomsData.length });
    if (roomsData.length && !rooms.length) {
      await loadGender();
      setShowNoRooms(true);
    }
  };

  return (
    <section className="page campus-page empty-rooms-page">
      <PageHeader
        eyebrow="Campus life · beta"
        title="Empty Rooms"
        description="Currently only supports 7th-floor rooms.(for CSE students only)"
      />
      <section className="empty-rooms-search">
        <div>
          <span className="empty-rooms-search__icon">
            <Search size={20} />
          </span>
          <div>
            <h2>Need a place to lock in?</h2>
            <p>Check which listed 7th-floor rooms are free right now.</p>
          </div>
        </div>
        <Button type="button" onClick={searchRooms}>
          <DoorOpen size={17} /> Search empty rooms
        </Button>
      </section>

      {result && <SearchResults result={result} />}
      <p className="empty-rooms-footer">
        You can&apos;t sue me if the room isn&apos;t empty. Paris Sir
        occasionally takes quizzes in supposedly empty rooms. You&apos;ve been
        warned. 💀
      </p>
      {showNoRooms && (
        <NoRoomsModal gender={gender} onClose={() => setShowNoRooms(false)} />
      )}
    </section>
  );
}

function SearchResults({ result }) {
  const { day, time, availability, rooms, roomCount } = result;
  if (availability === "weekend")
    return (
      <StatusMessage
        title="🎉 It's the weekend!"
        copy="No room hunting today. Go touch some grass. 😭"
      />
    );
  if (availability === "early")
    return (
      <StatusMessage
        title="🌅 Bro, how the hell did you get here this early?"
        copy="Go have some breakfast first. The rooms aren't going anywhere. 😭"
      />
    );
  if (availability === "after-hours")
    return (
      <StatusMessage
        title="🌙 Bro, you still wanna stay at the university right now?"
        copy="Go home. The rooms will still be here tomorrow. 💀"
      />
    );
  if (!rooms.length)
    return (
      <StatusMessage
        title={roomCount ? "No empty rooms right now." : "No rooms have been added yet."}
        copy={roomCount ? `We checked all ${roomCount} listed rooms. A little escape-plan popup has your next options.` : "Check back after an admin adds room availability."}
      />
    );
  return (
    <section className="empty-rooms-results" aria-live="polite">
      <div className="empty-rooms-results__heading">
        <div>
          <p className="eyebrow">
            {day} · {formatTime(time)}
          </p>
          <h2>
            {rooms.length} room{rooms.length === 1 ? "" : "s"} ready for you
          </h2>
        </div>
        <span>{rooms.length} EMPTY</span>
      </div>
      <div className="empty-rooms-grid">
        {rooms.map((room) => (
          <article className="empty-room-card" key={room.room}>
            <div className="empty-room-card__top">
              <span className="empty-room-card__type-icon">
                {room.type === "lab" ? (
                  <FlaskConical size={18} />
                ) : (
                  <DoorOpen size={18} />
                )}
              </span>
              <span className="empty-room-card__status">EMPTY</span>
            </div>
            <h3>{room.room}</h3>
            <p>{room.type}</p>
            <div className="empty-room-card__free">
              <Clock3 size={16} />
              <div>
                <strong>Free until {formatTime(room.freeUntil)}</strong>
                <span>
                  About {formatRemainingTime(time, room.freeUntil)} remaining.
                  😎
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function StatusMessage({ title, copy }) {
  return (
    <section className="empty-rooms-status" aria-live="polite">
      <h2>{title}</h2>
      <p>{copy}</p>
    </section>
  );
}
