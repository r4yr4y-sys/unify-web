import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../components/ui";
import StudyTimer from "../components/study/StudyTimer";

export default function StudyTimerPage() {
  const navigate = useNavigate();
  const [dailyTotals, setDailyTotals] = useState([]);
  const [historyError, setHistoryError] = useState("");
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const headers = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  });
  const loadHistory = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/study-sessions`, {
        headers: headers(),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Unable to load study history.");
      setDailyTotals(result.dailyTotals);
      setHistoryError("");
    } catch (error) {
      setHistoryError(error.message);
    } finally {
      setHistoryLoading(false);
    }
  };
  useEffect(() => {
    loadHistory();
  }, []);
  const saveSession = async (session) => {
    const response = await fetch(`${apiUrl}/api/study-sessions`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(session),
    });
    const result = await response.json();
    if (!response.ok)
      throw new Error(result.message || "Unable to save study session.");
    await loadHistory();
  };
  const max = Math.max(...dailyTotals.map((item) => item.durationMs), 1);
  const formatDuration = (durationMs) => {
    const minutes = Math.round(durationMs / 60000);
    return minutes >= 60
      ? `${Math.floor(minutes / 60)}h ${minutes % 60 ? `${minutes % 60}m` : ""}`
      : `${minutes}m`;
  };

  return (
    <section className="page study-page study-timer-page">
      <PageHeader
        eyebrow="Study"
        title="Study Timer"
        description="Start a focused session with a countdown or an open-ended study flow."
      />
      <StudyTimer
        onExit={() => navigate("/study")}
        onSessionComplete={saveSession}
        onViewHistory={() => {
          setHistoryOpen(true);
          loadHistory();
        }}
      />
      {historyOpen && (
        <div className="study-plan-modal-backdrop" role="presentation">
          <section
            className="study-plan-modal study-history"
            role="dialog"
            aria-modal="true"
            aria-labelledby="study-history-title"
          >
            <button
              type="button"
              className="study-plan-modal__close"
              onClick={() => setHistoryOpen(false)}
              aria-label="Close study history"
            >
              ×
            </button>
            <p className="eyebrow">Your consistency</p>
            <h2 id="study-history-title">Study time history</h2>
            {historyLoading ? (
              <p>Loading study history…</p>
            ) : historyError ? (
              <p className="study-timer-error" role="alert">
                {historyError}
              </p>
            ) : dailyTotals.length ? (
              <>
                <div className="study-history__chart">
                  {dailyTotals.slice(-14).map((item) => (
                    <div className="study-history__day" key={item.date}>
                      <span
                        className="study-history__bar"
                        style={{
                          height: `${Math.max(6, (item.durationMs / max) * 100)}%`,
                        }}
                        title={`${item.date}: ${formatDuration(item.durationMs)}`}
                      />
                      <strong>{formatDuration(item.durationMs)}</strong>
                      <small>
                        {new Date(`${item.date}T00:00:00`).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric" },
                        )}
                      </small>
                    </div>
                  ))}
                </div>
                <div className="study-history__sessions">
                  {dailyTotals
                    .slice(-7)
                    .reverse()
                    .map((item) => (
                      <p key={item.date}>
                        {item.date}:{" "}
                        <strong>{formatDuration(item.durationMs)}</strong>
                      </p>
                    ))}
                </div>
              </>
            ) : (
              <p>
                No completed study sessions yet. Finish a session to see your
                study time here.
              </p>
            )}
          </section>
        </div>
      )}
    </section>
  );
}
