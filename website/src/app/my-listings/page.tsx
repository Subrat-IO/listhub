import Link from "next/link";
import { redirect } from "next/navigation";
import { ListingCard } from "@/components/ListingCard";
import { serverApiFetch } from "@/lib/server-api";
import type { Listing } from "@/lib/types";
import styles from "../home.module.css";

export const dynamic = "force-dynamic";

type Resp = { listings: Listing[] };

export default async function MyListingsPage() {
  let listings: Listing[] = [];
  try {
    const res = await serverApiFetch<Resp>(`/me/listings`);
    listings = res.listings;
  } catch {
    redirect("/login?next=/my-listings");
  }

  return (
    <div>
      <div className={styles.gridTitleRow}>
        <div className={styles.gridTitle}>My listings</div>
        <Link className={styles.gridSub} href="/sell">
          Create new
        </Link>
      </div>

      {listings.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>You don&apos;t have any listings yet.</p>
      ) : (
        <div className={styles.grid}>
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
