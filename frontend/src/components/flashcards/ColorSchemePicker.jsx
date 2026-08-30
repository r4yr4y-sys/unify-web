const COLOR_SCHEMES = [
  { name: "Icy Blue", primary: "#A4D8FF", secondary: "#35393C" },
  { name: "Champagne Mist", primary: "#F7E7CE", secondary: "#80011F" },
  { name: "Lime Cream", primary: "#E3F482", secondary: "#FE4E96" },
  { name: "Lavender Blush", primary: "#FFE6ED", secondary: "#CF7486" },
  { name: "Pastel Pink", primary: "#FEBFCA", secondary: "#2B2B2B" },
  { name: "Blue Grey", primary: "#7298C7", secondary: "#F3D98F" },
  { name: "Soft Linen", primary: "#F5F1E6", secondary: "#F9A8BB" },
  { name: "Hunter Green", primary: "#3E5F44", secondary: "#DDD6B9" },
  { name: "Shadow Grey", primary: "#272727", secondary: "#D4AA7D" },
  { name: "Berry Blush", primary: "#974472", secondary: "#FEDDE8" },
  { name: "Cherry Blossom", primary: "#F9A8BB", secondary: "#FAFFC7" },
];

export { COLOR_SCHEMES };

export default function ColorSchemePicker({ selected, onSelect }) {
  return (
    <div className="color-scheme-picker">
      <p className="color-scheme-picker__label">
        Choose a color scheme for this flashcard pack.
      </p>
      <div className="color-scheme-picker__grid">
        {COLOR_SCHEMES.map((scheme) => (
          <button
            type="button"
            key={scheme.name}
            className={`color-swatch ${
              selected?.name === scheme.name ? "is-selected" : ""
            }`}
            onClick={() => onSelect(scheme)}
            aria-pressed={selected?.name === scheme.name}
            aria-label={scheme.name}
          >
            <span
              className="color-swatch__preview"
              style={{
                background: `linear-gradient(135deg, ${scheme.primary} 50%, ${scheme.secondary} 50%)`,
              }}
            />
            <span className="color-swatch__name">{scheme.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
