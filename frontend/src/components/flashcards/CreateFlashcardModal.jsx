import { useEffect, useState } from "react";
import { X } from "lucide-react";
import ColorSchemePicker from "./ColorSchemePicker";
import FlashcardCreator from "./FlashcardCreator";

export default function CreateFlashcardModal({ onClose, onCreate }) {
  const [step, setStep] = useState("setup");
  const [topic, setTopic] = useState("");
  const [cardCount, setCardCount] = useState(5);
  const [colorScheme, setColorScheme] = useState(null);
  const [confirmLeave, setConfirmLeave] = useState(false);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        if (step === "cards") {
          setConfirmLeave(true);
        } else {
          onClose();
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, step]);

  function handleSetupComplete() {
    if (!topic.trim() || !colorScheme) return;
    setStep("cards");
  }

  function handleCardsComplete(cards) {
    onCreate({
      topic: topic.trim(),
      cardCount,
      colorScheme,
      cards: cards.map((card, i) => ({
        id: `card-${Date.now()}-${i}`,
        question: card.question.trim(),
        answer: card.answer.trim(),
      })),
    });
  }

  function handleCancelCards() {
    setConfirmLeave(true);
  }

  function confirmExit() {
    setConfirmLeave(false);
    onClose();
  }

  return (
    <div className="flashcard-modal-backdrop" onClick={onClose}>
      <div
        className="flashcard-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Create flashcard pack"
      >
        <button
          type="button"
          className="flashcard-modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {step === "setup" && (
          <div className="flashcard-setup">
            <div className="flashcard-setup__header">
              <p className="eyebrow">Create new pack</p>
              <h2>New Flashcard Pack</h2>
              <p className="flashcard-setup__lead">
                Set up your flashcard pack with a topic, number of cards, and a
                color scheme.
              </p>
            </div>

            <label className="flashcard-setup__field">
              <span>Topic</span>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="What topic are you studying?"
                autoFocus
              />
            </label>

            <label className="flashcard-setup__field">
              <span>Number of Cards</span>
              <div className="flashcard-setup__count">
                <button
                  type="button"
                  onClick={() => setCardCount(Math.max(1, cardCount - 1))}
                  disabled={cardCount <= 1}
                  aria-label="Decrease card count"
                >
                  −
                </button>
                <span>{cardCount}</span>
                <button
                  type="button"
                  onClick={() => setCardCount(Math.min(50, cardCount + 1))}
                  disabled={cardCount >= 50}
                  aria-label="Increase card count"
                >
                  +
                </button>
              </div>
            </label>

            <ColorSchemePicker selected={colorScheme} onSelect={setColorScheme} />

            <div className="flashcard-setup__footer">
              <button
                type="button"
                className="flashcard-setup__start"
                onClick={handleSetupComplete}
                disabled={!topic.trim() || !colorScheme}
              >
                Start Creating Cards
              </button>
            </div>
          </div>
        )}

        {step === "cards" && (
          <FlashcardCreator
            cardCount={cardCount}
            onComplete={handleCardsComplete}
            onCancel={handleCancelCards}
          />
        )}

        {confirmLeave && (
          <div className="flashcard-confirm-backdrop">
            <div className="flashcard-confirm" role="alertdialog" aria-modal="true">
              <h3>Unsaved flashcards</h3>
              <p>You have unsaved flashcards. Are you sure you want to leave?</p>
              <div className="flashcard-confirm__actions">
                <button
                  type="button"
                  className="flashcard-confirm__stay"
                  onClick={() => setConfirmLeave(false)}
                >
                  Keep editing
                </button>
                <button
                  type="button"
                  className="flashcard-confirm__leave"
                  onClick={confirmExit}
                >
                  Leave
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
