import Link from "next/link";
import styles from "@/styles/admin.module.css";

export const dynamic = "force-dynamic";

export default function FeaturedPage() {
  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 10 }}>Featured listings</h1>
      <div className={styles.panel}>
        <p style={{ color: "var(--muted)", lineHeight: 1.55 }}>
          Featured placement is controlled via listing metadata. Use <Link href="/listings">Listings</Link> and toggle <strong>Feature</strong> /{" "}
          <strong>Unfeature</strong> on individual rows (calls <code>/api/v1/admin/listings/:id/status</code> with <code>featured</code>).
        </p>
      </div>
    </div>
  );
}
