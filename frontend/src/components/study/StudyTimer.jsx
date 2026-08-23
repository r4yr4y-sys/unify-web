import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "../ui";
import cozyCabinLoop from "../../assets/loopvideos/cozy cabin fireplace rain loop.mp4";
import rainyWindowLoop from "../../assets/loopvideos/rainy window seamless loop.mp4";

const backgrounds = [
  {
    id: "cozy-cabin",
    label: "Cozy Cabin",
    description: "Fireplace warmth with a soft rain loop.",
    src: cozyCabinLoop,
    tint: "amber",
  },
  {
    id: "rainy-window",
    label: "Rainy Window",
    description: "Cool window rain for a quieter focus.",
    src: rainyWindowLoop,
    tint: "blue",
  },
];

const modes = [
  {
    id: "countdown",
    label: "Set a Study Duration",
    description: "Choose hours and minutes for a fixed study block.",
  },
  {
    id: "open",
    label: "Open-Ended Study",
    description: "Start at 00:00:00 and keep going until you stop.",
  },
];

const breaks = [
  {
    id: "short",
    label: "5 min Short Break",
    durationMs: 5 * 60 * 1000,
  },
  {
    id: "long",
    label: "15 min Long Break",
    durationMs: 15 * 60 * 1000,
  },
];

function formatClock(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

function useSecondTicker(enabled) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setNow(Date.now());
    if (!enabled) return undefined;

    let timeoutId;
    const tick = () => {
      const current = Date.now();
      setNow(current);
      timeoutId = window.setTimeout(tick, 1000 - (current % 1000));
    };

    timeoutId = window.setTimeout(tick, 1000 - (Date.now() % 1000));

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [enabled]);

  return now;
}

function BackgroundCard({ item, selected, onSelect }) {
  return (
    <button
      type="button"
      className={`study-timer-background ${selected ? "is-selected" : ""}`}
      onClick={() => onSelect(item.id)}
      aria-pressed={selected}
    >
      <video
        className="study-timer-background__video"
        src={item.src}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
      />
      <span className="study-timer-background__shade" aria-hidden="true" />
      <span
        className={`study-timer-background__accent study-timer-background__accent--${item.tint}`}
      />
      <div className="study-timer-background__copy">
        <strong>{item.label}</strong>
        <p>{item.description}</p>
      </div>
    </button>
  );
}

function ModeCard({ item, selected, onSelect }) {
  return (
    <button
      type="button"
      className={`study-timer-mode ${selected ? "is-selected" : ""}`}
      onClick={() => onSelect(item.id)}
      aria-pressed={selected}
    >
      <strong>{item.label}</strong>
      <span>{item.description}</span>
    </button>
  );
}

function CircularTimer({ label, value, progress }) {
  const radius = 112;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="study-timer-ring" aria-live="polite">
      <svg
        className="study-timer-ring__svg"
        viewBox="0 0 260 260"
        aria-hidden="true"
      >
        <circle
          className="study-timer-ring__track"
          cx="130"
          cy="130"
          r={radius}
        />
        <circle
          className="study-timer-ring__progress"
          cx="130"
          cy="130"
          r={radius}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: dashOffset,
          }}
        />
      </svg>
      <div className="study-timer-ring__inner">
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function OpenEndedTimer({ value }) {
  return (
    <section className="study-timer-open-display">
      <div className="study-timer-open-display__header">
        <p className="eyebrow">Open-ended study</p>
        <span>Elapsed time</span>
      </div>
      <strong>{value}</strong>
      <div className="study-timer-open-display__bar" aria-hidden="true">
        <span />
      </div>
      <p>
        No maximum duration, no progress percentage. Keep your focus as long
        as you need.
      </p>
    </section>
  );
}

function BreakTimer({ label, value, onEndBreak, onFinish }) {
  return (
    <section className="study-timer-break">
      <p className="eyebrow">Break mode</p>
      <h2>{label || "Break"}</h2>
      <strong>{value}</strong>
      <p>
        Take a short reset. Your study timer will resume automatically when the
        break ends.
      </p>
      <div className="study-timer-actions">
        <Button type="button" variant="secondary" onClick={onEndBreak}>
          End break
        </Button>
        <Button type="button" variant="secondary" onClick={onFinish}>
          Finish session
        </Button>
      </div>
    </section>
  );
}

function FinishedTimer({ onRestart, onExit }) {
  return (
    <section className="study-timer-finished">
      <p className="eyebrow">Session complete</p>
      <h2>Nice work. Your study session has ended.</h2>
      <p>The timer is ready for another session whenever you are.</p>
      <div className="study-timer-actions">
        <Button type="button" onClick={onRestart}>
          Start another session
        </Button>
        <Button type="button" variant="secondary" onClick={onExit}>
          Back to Study
        </Button>
      </div>
    </section>
  );
}

function SetupModal({
  mode,
  hours,
  minutes,
  backgroundId,
  error,
  onClose,
  onStart,
  onModeChange,
  onHoursChange,
  onMinutesChange,
  onBackgroundChange,
}) {
  return (
    <div
      className="grades-modal-backdrop study-timer-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <section
        className="grades-modal study-timer-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="study-timer-setup-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="grades-modal__close"
          aria-label="Close study timer setup"
          onClick={onClose}
        >
          <X size={18} />
        </button>
        <p className="eyebrow">Study timer</p>
        <h2 id="study-timer-setup-title">Set up your session</h2>
        <p className="study-timer-modal__lead">
          Choose a study mode and background before you start.
        </p>
        <div className="study-timer-modal__grid">
          <section className="study-timer-panel">
            <div className="study-timer-panel__heading">
              <h3>Mode</h3>
              <span>Pick the pace that fits your session</span>
            </div>
            <div className="study-timer-mode-list">
              {modes.map((item) => (
                <ModeCard
                  key={item.id}
                  item={item}
                  selected={mode === item.id}
                  onSelect={onModeChange}
                />
              ))}
            </div>
            {mode === "countdown" ? (
              <div className="study-timer-duration">
                <label>
                  Hours
                  <input
                    type="number"
                    min="0"
                    max="12"
                    value={hours}
                    onChange={(event) => onHoursChange(event.target.value)}
                  />
                </label>
                <label>
                  Minutes
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={minutes}
                    onChange={(event) => onMinutesChange(event.target.value)}
                  />
                </label>
                <div className="study-timer-duration__preview">
                  <span>Selected duration</span>
                  <strong>
                    {formatClock(
                      ((Number(hours) || 0) * 60 + (Number(minutes) || 0)) * 60,
                    )}
                  </strong>
                </div>
              </div>
            ) : (
              <div className="study-timer-open-note">
                <strong>Open-ended study</strong>
                <p>
                  This session starts at 00:00:00 and keeps counting up until
                  you finish it.
                </p>
              </div>
            )}
            {error && <p className="study-timer-error">{error}</p>}
          </section>
          <section className="study-timer-panel">
            <div className="study-timer-panel__heading">
              <h3>Background</h3>
              <span>Choose a focused visual mood</span>
            </div>
            <div className="study-timer-backgrounds">
              {backgrounds.map((item) => (
                <BackgroundCard
                  key={item.id}
                  item={item}
                  selected={backgroundId === item.id}
                  onSelect={onBackgroundChange}
                />
              ))}
            </div>
          </section>
        </div>
        <div className="study-timer-modal__footer">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={onStart}>
            Start Study
          </Button>
        </div>
      </section>
    </div>
  );
}

export default function StudyTimer({ onExit }) {
  const [phase, setPhase] = useState("setup");
  const [mode, setMode] = useState("countdown");
  const [hours, setHours] = useState("2");
  const [minutes, setMinutes] = useState("30");
  const [backgroundId, setBackgroundId] = useState(backgrounds[0].id);
  const [error, setError] = useState("");
  const [session, setSession] = useState(null);
  const now = useSecondTicker(phase === "active" || phase === "break");

  useEffect(() => {
    setPhase("setup");
  }, []);

  const selectedBackground =
    backgrounds.find((item) => item.id === (session?.backgroundId || backgroundId)) ||
    backgrounds[0];

  const referenceNow = session?.pauseStartedAt ?? now;
  const elapsedMs = session
    ? Math.max(0, referenceNow - session.startedAt - session.pausedMs)
    : 0;
  const remainingMs =
    session?.mode === "countdown"
      ? Math.max(0, session.durationMs - elapsedMs)
      : 0;
  const breakRemainingMs =
    phase === "break" && session?.breakEndsAt
      ? Math.max(0, session.breakEndsAt - now)
      : 0;
  const timerLabel =
    session?.mode === "countdown"
      ? formatClock(remainingMs / 1000)
      : formatClock(elapsedMs / 1000);
  const timerProgress =
    session?.mode === "countdown" && session.durationMs > 0
      ? Math.min(1, elapsedMs / session.durationMs)
      : 0;

  useEffect(() => {
    if (phase !== "active" || session?.mode !== "countdown" || remainingMs > 0) {
      return undefined;
    }

    setPhase("finished");
    setSession((current) =>
      current
        ? {
            ...current,
            finishedAt: Date.now(),
            pauseStartedAt: null,
            breakEndsAt: null,
            breakLabel: null,
          }
        : current,
    );
    return undefined;
  }, [phase, remainingMs, session?.mode]);

  useEffect(() => {
    if (phase !== "break" || !session?.breakEndsAt || breakRemainingMs > 0) {
      return undefined;
    }

    setSession((current) => {
      if (!current) return current;
      const pausedAt = current.pauseStartedAt ?? Date.now();
      return {
        ...current,
        pausedMs: current.pausedMs + (Date.now() - pausedAt),
        pauseStartedAt: null,
        breakEndsAt: null,
        breakLabel: null,
      };
    });
    setPhase("active");
    return undefined;
  }, [breakRemainingMs, phase, session?.breakEndsAt]);

  function openSetup() {
    setError("");
    setPhase("setup");
  }

  function closeSetup() {
    setError("");
    if (onExit) {
      onExit();
      return;
    }
    setPhase("idle");
  }

  function startSession() {
    const durationMs =
      mode === "countdown"
        ? (Number(hours) * 60 + Number(minutes)) * 60 * 1000
        : 0;

    if (mode === "countdown" && (!Number.isFinite(durationMs) || durationMs <= 0)) {
      setError("Choose a study duration before starting.");
      return;
    }

    setSession({
      mode,
      durationMs,
      startedAt: Date.now(),
      pausedMs: 0,
      pauseStartedAt: null,
      breakEndsAt: null,
      breakLabel: null,
      backgroundId,
    });
    setPhase("active");
    setError("");
  }

  function pauseSession() {
    if (phase !== "active" || !session) return;
    setSession((current) =>
      current && !current.pauseStartedAt
        ? { ...current, pauseStartedAt: Date.now() }
        : current,
    );
    setPhase("paused");
  }

  function resumeSession() {
    if (phase !== "paused" || !session) return;
    setSession((current) => {
      if (!current || !current.pauseStartedAt) return current;
      return {
        ...current,
        pausedMs: current.pausedMs + (Date.now() - current.pauseStartedAt),
        pauseStartedAt: null,
      };
    });
    setPhase("active");
  }

  function startBreak(durationMs, label) {
    if (phase !== "active" || !session) return;
    const breakStart = Date.now();
    setSession((current) =>
      current
        ? {
            ...current,
            pauseStartedAt: breakStart,
            breakEndsAt: breakStart + durationMs,
            breakLabel: label,
          }
        : current,
    );
    setPhase("break");
  }

  function endBreakEarly() {
    if (phase !== "break" || !session) return;
    setSession((current) => {
      if (!current) return current;
      const pausedAt = current.pauseStartedAt ?? Date.now();
      return {
        ...current,
        pausedMs: current.pausedMs + (Date.now() - pausedAt),
        pauseStartedAt: null,
        breakEndsAt: null,
        breakLabel: null,
      };
    });
    setPhase("active");
  }

  function finishSession() {
    if (!session) return;
    setSession((current) =>
      current
        ? {
            ...current,
            finishedAt: Date.now(),
            pauseStartedAt: null,
            breakEndsAt: null,
            breakLabel: null,
          }
        : current,
    );
    setPhase("finished");
  }

  function restartSession() {
    setSession(null);
    setPhase("setup");
    setError("");
  }

  const content =
    phase === "finished" ? (
      <FinishedTimer onRestart={restartSession} onExit={closeSetup} />
    ) : phase === "break" ? (
      <BreakTimer
        label={session?.breakLabel}
        value={formatClock(breakRemainingMs / 1000)}
        onEndBreak={endBreakEarly}
        onFinish={finishSession}
      />
    ) : session?.mode === "countdown" && phase !== "setup" && phase !== "idle" ? (
      <CircularTimer
        label="Time remaining"
        value={timerLabel}
        progress={timerProgress}
      />
    ) : session?.mode === "open" && phase !== "setup" && phase !== "idle" ? (
      <OpenEndedTimer value={timerLabel} />
    ) : (
      <section className="study-timer-resting">
        <p className="eyebrow">Study timer</p>
        <h2>Ready when you are.</h2>
        <p>
          Choose a setup, start a session, and use the quiet timer view to keep
          your focus on track.
        </p>
        <Button type="button" onClick={openSetup}>
          Start Study
        </Button>
      </section>
    );

  return (
    <div className="study-timer-shell">
      {phase === "setup" && (
        <SetupModal
          mode={mode}
          hours={hours}
          minutes={minutes}
          backgroundId={backgroundId}
          error={error}
          onClose={closeSetup}
          onStart={startSession}
          onModeChange={setMode}
          onHoursChange={setHours}
          onMinutesChange={setMinutes}
          onBackgroundChange={setBackgroundId}
        />
      )}

      {(phase === "active" || phase === "paused" || phase === "break" || phase === "finished") && (
        <div className="study-timer-overlay">
          <video
            key={selectedBackground.id}
            className="study-timer-overlay__video"
            src={selectedBackground.src}
            autoPlay
            loop
            muted
            playsInline
            aria-hidden="true"
          />
          <div className="study-timer-overlay__shade" aria-hidden="true" />
          <div className="study-timer-overlay__content">
            <div className="study-timer-overlay__top">
              <div>
                <p className="eyebrow">Study session</p>
                <h2>
                  {phase === "break"
                    ? session?.breakLabel || "Break time"
                    : selectedBackground.label}
                </h2>
              </div>
              <button
                type="button"
                className="study-timer-overlay__exit"
                onClick={phase === "finished" ? closeSetup : finishSession}
              >
                {phase === "finished" ? "Close" : "Finish"}
              </button>
            </div>

            {content}

            {phase === "active" && (
              <div className="study-timer-actions">
                <Button type="button" variant="secondary" onClick={pauseSession}>
                  Pause
                </Button>
                {breaks.map((item) => (
                  <Button
                    type="button"
                    variant="secondary"
                    key={item.id}
                    onClick={() => startBreak(item.durationMs, item.label)}
                  >
                    {item.label}
                  </Button>
                ))}
                <Button type="button" onClick={finishSession}>
                  Finish
                </Button>
              </div>
            )}

            {phase === "paused" && (
              <div className="study-timer-actions">
                <Button type="button" onClick={resumeSession}>
                  Resume
                </Button>
                <Button type="button" variant="secondary" onClick={finishSession}>
                  Finish
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {phase === "idle" && (
        <section className="study-timer-resting study-timer-resting--compact">
          <p className="eyebrow">Study timer</p>
          <h2>Ready when you are.</h2>
          <p>
            Choose a setup, start a session, and use the quiet timer view to
            keep your focus on track.
          </p>
          <Button type="button" onClick={openSetup}>
            Start Study
          </Button>
        </section>
      )}
    </div>
  );
}
