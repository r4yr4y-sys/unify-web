import { useState, useEffect } from "react";
import { Plus, Search, Layers } from "lucide-react";
import { PageHeader } from "../components/ui";
import FlashcardPackCard from "../components/flashcards/FlashcardPackCard";
import CreateFlashcardModal from "../components/flashcards/CreateFlashcardModal";
import FlashcardReviewModal from "../components/flashcards/FlashcardReviewModal";

const STORAGE_KEY = "unify-flashcards";

function loadPacks() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function savePacks(packs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(packs));
}

export default function FlashcardsPage() {
  const [packs, setPacks] = useState(loadPacks);
  const [showCreate, setShowCreate] = useState(false);
  const [reviewPack, setReviewPack] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    savePacks(packs);
  }, [packs]);

  function handleCreate({ topic, colorScheme, cards }) {
    const newPack = {
      id: `pack-${Date.now()}`,
      topic,
      colorScheme,
      createdAt: new Date().toISOString(),
      cards,
    };
    setPacks((prev) => [newPack, ...prev]);
    setShowCreate(false);
  }

  function handleUpdatePack(updatedPack) {
    setPacks((prev) =>
      prev.map((pack) => (pack.id === updatedPack.id ? updatedPack : pack)),
    );
    setReviewPack(updatedPack);
  }

  const filteredPacks = packs
    .filter((pack) =>
      pack.topic.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "most-cards":
          return b.cards.length - a.cards.length;
        case "topic":
          return a.topic.localeCompare(b.topic);
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  return (
    <section className="page study-page flashcards-page">
      <PageHeader
        eyebrow="Study"
        title="Flashcards"
        description="Create and review flashcard packs to memorize key concepts efficiently."
        actions={
          <button
            type="button"
            className="flashcards-page__create-btn"
            onClick={() => setShowCreate(true)}
          >
            <Plus size={18} />
            Create New Flashcard
          </button>
        }
      />

      {packs.length === 0 ? (
        <div className="flashcards-empty">
          <div className="flashcards-empty__icon">
            <Layers size={48} />
          </div>
          <h2>No flashcard packs yet</h2>
          <p>
            Create your first flashcard pack to start studying.
          </p>
          <button
            type="button"
            className="flashcards-page__create-btn"
            onClick={() => setShowCreate(true)}
          >
            <Plus size={18} />
            Create New Flashcard
          </button>
        </div>
      ) : (
        <>
          <div className="flashcards-toolbar">
            <div className="flashcards-search">
              <Search size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by topic..."
              />
            </div>
            <div className="flashcards-sort">
              <label>
                <span>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="most-cards">Most cards</option>
                  <option value="topic">Topic A–Z</option>
                </select>
              </label>
            </div>
          </div>

          <div className="flashcards-section">
            <p className="eyebrow">Your Flashcard Packs</p>
            <h2>Review past cards</h2>
          </div>

          {filteredPacks.length === 0 ? (
            <div className="flashcards-no-results">
              <p>No packs match your search.</p>
            </div>
          ) : (
            <div className="flashcards-grid">
              {filteredPacks.map((pack) => (
                <FlashcardPackCard
                  key={pack.id}
                  pack={pack}
                  onOpen={() => setReviewPack(pack)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {showCreate && (
        <CreateFlashcardModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}

      {reviewPack && (
        <FlashcardReviewModal
          pack={reviewPack}
          onClose={() => setReviewPack(null)}
          onUpdate={handleUpdatePack}
        />
      )}
    </section>
  );
}
