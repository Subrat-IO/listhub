import { serverApiFetch } from "@/lib/server-api";
import styles from "@/styles/admin.module.css";
import { ListingActions } from "./listing-actions";

export const dynamic = "force-dynamic";

type Listing = {
  id: string;
  title: string;
  status: string;
  featured: boolean;
  seller: { profile?: { displayName?: string | null } | null };
};

type Resp = { listings: Listing[] };

export default async function AdminListingsPage() {
  let rows: Listing[] = [];
  let error: string | null = null;
  try {
    const res = await serverApiFetch<Resp>(`/admin/listings?pageSize=50`);
    rows = res.listings;
  } catch {
    error = "Unauthorized or API unavailable.";
  }

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 10 }}>Listings</h1>
      {error ? (
        <div className={styles.panel} style={{ color: "var(--danger)" }}>
          {error}
        </div>
      ) : (
        <div className={styles.panel}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Seller</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => (
                <tr key={l.id}>
                  <td>{l.title}</td>
                  <td>{l.seller.profile?.displayName ?? "—"}</td>
                  <td>{l.status}</td>
                  <td>{l.featured ? "yes" : "no"}</td>
                  <td>
                    <ListingActions listingId={l.id} status={l.status} featured={l.featured} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
