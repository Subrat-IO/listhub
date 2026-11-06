import Link from "next/link";
import type { Listing } from "@/lib/types";
import styles from "./listing-card.module.css";

function money(listing: Listing) {
  const n = Number(listing.askingPrice);
  if (Number.isNaN(n)) return `${listing.askingPrice} ${listing.currency}`;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: listing.currency || "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function ListingCard({ listing }: { listing: Listing }) {
  const img = listing.images[0]?.url;
  const fees = listing.fees?.length
    ? `${listing.fees.length} disclosed fee${listing.fees.length === 1 ? "" : "s"}`
    : "No extra fees listed";

  return (
    <Link href={`/listing/${listing.id}`} className={styles.card}>
      <div className={styles.thumb} style={img ? { backgroundImage: `url(${img})` } : undefined} />
      <div className={styles.body}>
        <div className={styles.row}>
          <div className={styles.title}>{listing.title}</div>
          {listing.featured ? <span className={styles.badge}>Featured</span> : null}
        </div>
        <div className={styles.meta}>
          <span>{listing.category.name}</span>
          <span aria-hidden>•</span>
          <span>{listing.location ?? "Location TBD"}</span>
        </div>
        <div className={styles.priceRow}>
          <div className={styles.price}>{money(listing)}</div>
          <div className={styles.fees}>{fees}</div>
        </div>
      </div>
    </Link>
  );
}
