import Link from "next/link";
import { HeroBanner } from "@/components/HeroBanner";
import { ListingCard } from "@/components/ListingCard";
import { publicEnv } from "@/lib/env";
import { serverApiFetch } from "@/lib/server-api";
import type { Listing } from "@/lib/types";
import { toQueryString } from "@/lib/query";
import styles from "./home.module.css";

export const dynamic = "force-dynamic";

type ListingsResponse = { listings: Listing[] };

async function safeFeatured(): Promise<Listing[]> {
  try {
    const res = await serverApiFetch<ListingsResponse>(`/listings${toQueryString({ featured: "true" })}`);
    return res.listings.slice(0, 6);
  } catch {
    return [];
  }
}

async function safeRecent(): Promise<Listing[]> {
  try {
    const res = await serverApiFetch<ListingsResponse>(`/listings${toQueryString({ pageSize: "8" })}`);
    return res.listings;
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [featured, recent] = await Promise.all([safeFeatured(), safeRecent()]);

  return (
    <div>
      <HeroBanner />

      <div className={styles.section}>
        <div className={styles.gridTitleRow}>
          <div className={styles.gridTitle}>Featured listings</div>
          <Link className={styles.gridSub} href="/explore?featured=true">
            View all
          </Link>
        </div>
        {featured.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 14 }}>
            No featured listings yet. Start the API &amp; database, then feature items from{" "}
            <Link href="http://localhost:3001/dashboard" style={{ textDecoration: "underline" }}>
              ListHub Admin
            </Link>
            .
          </p>
        ) : (
          <div className={styles.grid}>
            {featured.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.gridTitleRow}>
          <div className={styles.gridTitle}>Recently listed</div>
          <Link className={styles.gridSub} href="/explore">
            Browse explore
          </Link>
        </div>
        {recent.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 14 }}>
            Connect to the backend at <code>{publicEnv.apiUrl}</code> to load live listings.
          </p>
        ) : (
          <div className={styles.grid}>
            {recent.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
