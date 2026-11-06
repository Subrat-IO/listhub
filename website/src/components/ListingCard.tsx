import Link from "next/link";
import type { Listing } from "@/lib/types";
import { formatInr, timeAgo } from "@/lib/format";
import { FavoriteButton } from "./FavoriteButton";
import styles from "./listing-card.module.css";

export function ListingCard({ listing }: { listing: Listing }) {
  const img = listing.images[0]?.url;
  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <Link href={`/listing/${listing.id}`}>
          {img ? <img src={img} alt="" /> : <div className={styles.placeholder} />}
        </Link>
        <FavoriteButton listingId={listing.id} />
      </div>
      <Link href={`/listing/${listing.id}`} className={styles.body}>
        <div className={styles.price}>{formatInr(listing.askingPrice)}</div>
        <div className={styles.title}>{listing.title}</div>
        <div className={styles.meta}>
          <span>{listing.location ?? "India"}</span>
          <span>·</span>
          <span>{timeAgo(listing.createdAt)}</span>
        </div>
      </Link>
    </article>
  );
}
