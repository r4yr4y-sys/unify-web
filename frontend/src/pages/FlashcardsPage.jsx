import { useState, useEffect } from "react";
import { Plus, Search, Layers } from "lucide-react";
import { PageHeader } from "../components/ui";
import FlashcardPackCard from "../components/flashcards/FlashcardPackCard";
import CreateFlashcardModal from "../components/flashcards/CreateFlashcardModal";
import FlashcardReviewModal from "../components/flashcards/FlashcardReviewModal";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("authToken")}`,
});

export default function FlashcardsPage() {
  const [packs, setPacks] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [reviewPack, setReviewPack] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch(`${apiUrl}/api/flashcard-packs`, { headers: authHeaders() })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok)
          throw new Error(result.message || "Unable to load flashcards.");
        return result.packs;
      })
      .then((savedPacks) => {
        if (active) setPacks(savedPacks);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleCreate(values) {
    setError("");
    try {
      const response = await fetch(`${apiUrl}/api/flashcard-packs`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Unable to create flashcard pack.");
      setPacks((prev) => [result.pack, ...prev]);
      setShowCreate(false);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleUpdatePack(updatedPack) {
    setError("");
    try {
      const response = await fetch(
        `${apiUrl}/api/flashcard-packs/${updatedPack.id}`,
        {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify(updatedPack),
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Unable to save flashcards.");
      setPacks((prev) =>
        prev.map((pack) => (pack.id === result.pack.id ? result.pack : pack)),
      );
      setReviewPack(result.pack);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleDeletePack(pack) {
    setError("");
    try {
      const response = await fetch(`${apiUrl}/api/flashcard-packs/${pack.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Unable to delete flashcard pack.");
      }
      setPacks((current) => current.filter((item) => item.id !== pack.id));
      setReviewPack(null);
    } catch (requestError) {
      setError(requestError.message);
    }
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
      {error && (
        <p className="flashcards-no-results" role="alert">
          {error}
        </p>
      )}
      {loading && <p>Loading flashcard packs…</p>}

      {!loading && packs.length === 0 ? (
        <div className="flashcards-empty">
          <div className="flashcards-empty__icon">
            <Layers size={48} />
          </div>
          <h2>No flashcard packs yet</h2>
          <p>Create your first flashcard pack to start studying.</p>
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
          onDeletePack={handleDeletePack}
        />
      )}
    </section>
  );
}
