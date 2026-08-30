function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function FlashcardPackCard({ pack, onOpen }) {
  const { topic, cards, createdAt, colorScheme } = pack;
  const cardCount = cards.length;

  return (
    <button
      type="button"
      className="flashcard-pack-card"
      onClick={onOpen}
      style={{
        "--pack-primary": colorScheme.primary,
        "--pack-secondary": colorScheme.secondary,
      }}
    >
      <div className="flashcard-pack-card__accent" aria-hidden="true">
        <span />
        <span />
      </div>
      <div className="flashcard-pack-card__content">
        <h3>{topic}</h3>
        <p className="flashcard-pack-card__count">
          {cardCount} {cardCount === 1 ? "card" : "cards"}
        </p>
        <p className="flashcard-pack-card__date">
          Created {formatDate(createdAt)}
        </p>
      </div>
      <div className="flashcard-pack-card__scheme" aria-hidden="true">
        <span style={{ background: colorScheme.primary }} />
        <span style={{ background: colorScheme.secondary }} />
      </div>
    </button>
  );
}
