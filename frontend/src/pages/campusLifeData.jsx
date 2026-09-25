export const announcements = [];
export const events = [];

export const marketplaceItems = [
  {
    id: 1,
    title: "Calculus: Early Transcendentals",
    price: "৳2400",
    detail: "Like new · 9th edition",
    category: "Books",
    seller: "Adnan",
    hue: "blue",
    icon: "BOOK",
  },
  {
    id: 2,
    title: "Scientific calculator",
    price: "৳1800",
    detail: "Casio fx-991EX · Excellent",
    category: "Academic",
    seller: "Nowfel",
    hue: "violet",
    icon: "fx",
  },
  {
    id: 3,
    title: "Desk lamp",
    price: "৳1200",
    detail: "Warm light · Adjustable arm",
    category: "Home",
    seller: "Jayed",
    hue: "amber",
    icon: "LAMP",
  },
  {
    id: 4,
    title: "Campus hoodie",
    price: "৳1600",
    detail: "Medium · Worn twice",
    category: "Fashion",
    seller: "Imran",
    hue: "pink",
    icon: "UNI",
  },
  {
    id: 5,
    title: "USB-C hub",
    price: "৳1500",
    detail: "HDMI + USB 3.0 ports",
    category: "Tech",
    seller: "Tahsin",
    hue: "green",
    icon: "USB",
  },
  {
    id: 6,
    title: "Biology lab coat",
    price: "৳900",
    detail: "Size S · Freshly cleaned",
    category: "Academic",
    seller: "Rafi",
    hue: "orange",
    icon: "LAB",
  },
];

export const foundItems = [
  {
    id: 1,
    status: "Found",
    title: "Black wireless earbuds",
    area: "Found near the North Library entrance",
    date: "Today, 11:40 AM",
    hue: "violet",
    icon: "◖◗",
  },
  {
    id: 2,
    status: "Lost",
    title: "Silver water bottle",
    area: "Last seen in room 7A03",
    date: "Yesterday",
    hue: "blue",
    icon: "H₂O",
  },
  {
    id: 3,
    status: "Found",
    title: "Student ID card",
    area: "Handed in at the Student Commons desk",
    date: "Dec 8",
    hue: "green",
    icon: "ID",
  },
  {
    id: 4,
    status: "Lost",
    title: "Grey knit scarf",
    area: "Last seen around the Arts courtyard",
    date: "Dec 7",
    hue: "amber",
    icon: "~",
  },
];

export function ItemArtwork({ label, hue }) {
  return (
    <div className={`item-artwork item-artwork--${hue}`} aria-hidden="true">
      <span>{label}</span>
    </div>
  );
}
