import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function FlashcardCreator({ cardCount, onComplete, onCancel }) {
  const [cards, setCards] = useState(
    Array.from({ length: cardCount }, () => ({ question: "", answer: "" })),
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === cardCount - 1;
  const currentCard = cards[currentIndex];

  function updateCard(field, value) {
    setCards((prev) =>
      prev.map((card, i) =>
        i === currentIndex ? { ...card, [field]: value } : card,
      ),
    );
  }

  function goPrevious() {
    if (!isFirst) setCurrentIndex(currentIndex - 1);
  }

  function goNext() {
    if (!isLast) setCurrentIndex(currentIndex + 1);
  }

  function handleFinish() {
    const allFilled = cards.every(
      (card) => card.question.trim() && card.answer.trim(),
    );
    if (!allFilled) return;
    onComplete(cards);
  }

  const canProceed =
    currentCard.question.trim() && currentCard.answer.trim();

  return (
    <div className="flashcard-creator">
      <div className="flashcard-creator__progress">
        <span className="eyebrow">Create cards</span>
        <p>
          Card {currentIndex + 1} of {cardCount}
        </p>
        <div className="flashcard-creator__progress-bar">
          <span
            style={{ width: `${((currentIndex + 1) / cardCount) * 100}%` }}
          />
        </div>
      </div>

      <div className="flashcard-creator__fields">
        <label className="flashcard-creator__field">
          <span>Question</span>
          <textarea
            value={currentCard.question}
            onChange={(e) => updateCard("question", e.target.value)}
            placeholder="Enter your question..."
            rows={3}
          />
        </label>
        <label className="flashcard-creator__field">
          <span>Answer</span>
          <textarea
            value={currentCard.answer}
            onChange={(e) => updateCard("answer", e.target.value)}
            placeholder="Enter the answer..."
            rows={3}
          />
        </label>
      </div>

      <div className="flashcard-creator__nav">
        <button
          type="button"
          className="flashcard-creator__nav-btn"
          onClick={goPrevious}
          disabled={isFirst}
        >
          <ChevronLeft size={18} />
          Previous
        </button>
        {isLast ? (
          <button
            type="button"
            className="flashcard-creator__finish"
            onClick={handleFinish}
            disabled={!canProceed}
          >
            Create Pack
          </button>
        ) : (
          <button
            type="button"
            className="flashcard-creator__next"
            onClick={goNext}
            disabled={!canProceed}
          >
            Save & Next
            <ChevronRight size={18} />
          </button>
        )}
      </div>

      {onCancel && (
        <button
          type="button"
          className="flashcard-creator__cancel"
          onClick={onCancel}
        >
          Cancel
        </button>
      )}
    </div>
  );
}
