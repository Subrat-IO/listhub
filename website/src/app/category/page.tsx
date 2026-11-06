import Link from "next/link";
import { serverApiFetch } from "@/lib/server-api";
import type { Category } from "@/lib/types";
import { toQueryString } from "@/lib/query";
import styles from "../home.module.css";

export const dynamic = "force-dynamic";

type CategoriesResponse = { categories: Category[] };

export default async function CategoryPage() {
  let categories: Category[] = [];
  try {
    const c = await serverApiFetch<CategoriesResponse>("/categories");
    categories = c.categories;
  } catch {
    categories = [];
  }

  return (
    <div>
      <div className={styles.gridTitleRow}>
        <div className={styles.gridTitle}>Categories</div>
        <div className={styles.gridSub}>Browse by vertical</div>
      </div>

      <div className={styles.grid}>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/explore${toQueryString({ categoryId: c.id })}`}
            style={{
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: 14,
              background: "var(--surface)",
            }}
          >
            <div style={{ fontWeight: 750 }}>{c.name}</div>
            <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 6 }}>{c.description ?? c.slug}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
