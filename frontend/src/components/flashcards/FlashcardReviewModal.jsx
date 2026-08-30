import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Shuffle,
  Pencil,
  Trash2,
  Plus,
  Check,
} from "lucide-react";

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function FlashcardReviewModal({ pack, onClose, onUpdate }) {
  const [displayCards, setDisplayCards] = useState(pack.cards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");

  useEffect(() => {
    setDisplayCards(pack.cards);
    setCurrentIndex(0);
    setFlipped(false);
    setIsShuffled(false);
    setEditing(false);
    setShowAddCard(false);
  }, [pack.cards]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        if (editing || showAddCard || confirmDelete) {
          setEditing(false);
          setShowAddCard(false);
          setConfirmDelete(false);
        } else {
          onClose();
        }
      }
      if (editing || showAddCard || confirmDelete) return;
      if (e.key === "ArrowLeft") goPrevious();
      if (e.key === "ArrowRight") goNext();
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped(!flipped);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipped, editing, showAddCard, confirmDelete, currentIndex]);

  const card = displayCards[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === displayCards.length - 1;

  function goPrevious() {
    if (!isFirst) {
      setCurrentIndex(currentIndex - 1);
      setFlipped(false);
    }
  }

  function goNext() {
    if (!isLast) {
      setCurrentIndex(currentIndex + 1);
      setFlipped(false);
    }
  }

  function handleShuffle() {
    if (isShuffled) {
      setDisplayCards(pack.cards);
      setIsShuffled(false);
    } else {
      setDisplayCards(shuffleArray(pack.cards));
      setIsShuffled(true);
    }
    setCurrentIndex(0);
    setFlipped(false);
  }

  function startEdit() {
    setEditQuestion(card.question);
    setEditAnswer(card.answer);
    setEditing(true);
    setFlipped(false);
  }

  function saveEdit() {
    if (!editQuestion.trim() || !editAnswer.trim()) return;
    const updatedCards = pack.cards.map((c) =>
      c.id === card.id
        ? { ...c, question: editQuestion.trim(), answer: editAnswer.trim() }
        : c,
    );
    onUpdate({ ...pack, cards: updatedCards });
    setEditing(false);
  }

  function handleDelete() {
    if (displayCards.length <= 1) return;
    const updatedCards = pack.cards.filter((c) => c.id !== card.id);
    onUpdate({ ...pack, cards: updatedCards });
    setConfirmDelete(false);
    setCurrentIndex(Math.max(0, currentIndex - 1));
    setFlipped(false);
  }

  function handleAddCard() {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    const newCard = {
      id: `card-${Date.now()}`,
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
    };
    onUpdate({ ...pack, cards: [...pack.cards, newCard] });
    setNewQuestion("");
    setNewAnswer("");
    setShowAddCard(false);
  }

  if (!card) return null;

  const { colorScheme } = pack;
  const primary = colorScheme.primary;
  const secondary = colorScheme.secondary;

  return (
    <div className="flashcard-review-backdrop" onClick={onClose}>
      <div
        className="flashcard-review"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Review ${pack.topic}`}
        style={{ "--pack-primary": primary, "--pack-secondary": secondary }}
      >
        <button
          type="button"
          className="flashcard-review__close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="flashcard-review__header">
          <p className="eyebrow">{pack.topic}</p>
          <h2>Review Flashcards</h2>
        </div>

        {editing ? (
          <div className="flashcard-edit">
            <label className="flashcard-edit__field">
              <span>Question</span>
              <textarea
                value={editQuestion}
                onChange={(e) => setEditQuestion(e.target.value)}
                rows={3}
                autoFocus
              />
            </label>
            <label className="flashcard-edit__field">
              <span>Answer</span>
              <textarea
                value={editAnswer}
                onChange={(e) => setEditAnswer(e.target.value)}
                rows={3}
              />
            </label>
            <div className="flashcard-edit__actions">
              <button
                type="button"
                className="flashcard-edit__save"
                onClick={saveEdit}
                disabled={!editQuestion.trim() || !editAnswer.trim()}
              >
                <Check size={16} />
                Save
              </button>
              <button
                type="button"
                className="flashcard-edit__cancel"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : showAddCard ? (
          <div className="flashcard-add">
            <h3>Add New Card</h3>
            <label className="flashcard-add__field">
              <span>Question</span>
              <textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Enter your question..."
                rows={3}
                autoFocus
              />
            </label>
            <label className="flashcard-add__field">
              <span>Answer</span>
              <textarea
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="Enter the answer..."
                rows={3}
              />
            </label>
            <div className="flashcard-add__actions">
              <button
                type="button"
                className="flashcard-add__confirm"
                onClick={handleAddCard}
                disabled={!newQuestion.trim() || !newAnswer.trim()}
              >
                <Plus size={16} />
                Add Card
              </button>
              <button
                type="button"
                className="flashcard-add__cancel"
                onClick={() => setShowAddCard(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div
              className={`flashcard-review__card ${flipped ? "is-flipped" : ""}`}
              onClick={() => setFlipped(!flipped)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  setFlipped(!flipped);
                }
              }}
              aria-label={flipped ? "Show question" : "Show answer"}
            >
              <div className="flashcard-review__card-inner">
                <div
                  className="flashcard-review__card-front"
                  style={{ background: primary, color: secondary }}
                >
                  <span className="flashcard-review__card-label">Question</span>
                  <p>{card.question}</p>
                  <span className="flashcard-review__card-hint">
                    Click to reveal
                  </span>
                </div>
                <div
                  className="flashcard-review__card-back"
                  style={{ background: secondary, color: primary }}
                >
                  <span className="flashcard-review__card-label">Answer</span>
                  <p>{card.answer}</p>
                  <span className="flashcard-review__card-hint">Click to flip back</span>
                </div>
              </div>
            </div>

            <div className="flashcard-review__controls">
              <button
                type="button"
                className="flashcard-review__nav-btn"
                onClick={goPrevious}
                disabled={isFirst}
                aria-label="Previous card"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flashcard-review__progress">
                <span>
                  {currentIndex + 1} / {displayCards.length}
                </span>
              </div>

              <button
                type="button"
                className="flashcard-review__nav-btn"
                onClick={goNext}
                disabled={isLast}
                aria-label="Next card"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="flashcard-review__tools">
              <button
                type="button"
                className={`flashcard-review__tool ${isShuffled ? "is-active" : ""}`}
                onClick={handleShuffle}
                aria-label="Shuffle cards"
              >
                <Shuffle size={16} />
                {isShuffled ? "Shuffled" : "Shuffle"}
              </button>
              <button
                type="button"
                className="flashcard-review__tool"
                onClick={startEdit}
                aria-label="Edit card"
              >
                <Pencil size={16} />
                Edit
              </button>
              <button
                type="button"
                className="flashcard-review__tool"
                onClick={() => setConfirmDelete(true)}
                disabled={displayCards.length <= 1}
                aria-label="Delete card"
              >
                <Trash2 size={16} />
                Delete
              </button>
              <button
                type="button"
                className="flashcard-review__tool"
                onClick={() => setShowAddCard(true)}
                aria-label="Add card"
              >
                <Plus size={16} />
                Add
              </button>
            </div>
          </>
        )}

        {confirmDelete && (
          <div className="flashcard-confirm-backdrop">
            <div className="flashcard-confirm" role="alertdialog" aria-modal="true">
              <h3>Delete this flashcard?</h3>
              <p>This action cannot be undone.</p>
              <div className="flashcard-confirm__actions">
                <button
                  type="button"
                  className="flashcard-confirm__stay"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="flashcard-confirm__leave"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
