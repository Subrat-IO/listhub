import { redirect } from "next/navigation";
import { ListingCard } from "@/components/ListingCard";
import { serverApiFetch } from "@/lib/server-api";
import type { Listing } from "@/lib/types";
import styles from "../home.module.css";

export const dynamic = "force-dynamic";

type Resp = { favorites: Listing[] };

export default async function FavoritesPage() {
  let favorites: Listing[] = [];
  try {
    const res = await serverApiFetch<Resp>(`/me/favorites`);
    favorites = res.favorites;
  } catch {
    redirect("/login?next=/favorites");
  }

  return (
    <div>
      <div className={styles.gridTitleRow}>
        <div className={styles.gridTitle}>Favorites</div>
        <div className={styles.gridSub}>{favorites.length} saved</div>
      </div>

      {favorites.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>No favorites yet.</p>
      ) : (
        <div className={styles.grid}>
          {favorites.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
