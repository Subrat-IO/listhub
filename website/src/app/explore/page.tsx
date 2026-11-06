import Link from "next/link";
import { ListingCard } from "@/components/ListingCard";
import { serverApiFetch } from "@/lib/server-api";
import type { Category, Listing } from "@/lib/types";
import { toQueryString } from "@/lib/query";
import styles from "../home.module.css";

export const dynamic = "force-dynamic";

type CategoriesResponse = { categories: Category[] };
type ListingsResponse = { listings: Listing[]; total: number; page: number; pageSize: number };

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const categoryId = typeof sp.categoryId === "string" ? sp.categoryId : undefined;
  const location = typeof sp.location === "string" ? sp.location : undefined;
  const featured = typeof sp.featured === "string" ? sp.featured : undefined;

  let categories: Category[] = [];
  let listings: Listing[] = [];
  let total = 0;

  try {
    const c = await serverApiFetch<CategoriesResponse>("/categories");
    categories = c.categories;
  } catch {
    categories = [];
  }

  try {
    const l = await serverApiFetch<ListingsResponse>(
      `/listings${toQueryString({ q, categoryId, location, featured, pageSize: "24" })}`
    );
    listings = l.listings;
    total = l.total;
  } catch {
    listings = [];
    total = 0;
  }

  return (
    <div>
      <div className={styles.gridTitleRow}>
        <div className={styles.gridTitle}>Explore</div>
        <div className={styles.gridSub}>{total} results</div>
      </div>

      <form
        action="/explore"
        method="get"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <input
          name="q"
          placeholder="Search"
          defaultValue={q ?? ""}
          style={{
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "10px 12px",
            background: "var(--surface2)",
          }}
        />
        <select
          name="categoryId"
          defaultValue={categoryId ?? ""}
          style={{
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "10px 12px",
            background: "var(--surface2)",
          }}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          name="location"
          placeholder="Location"
          defaultValue={location ?? ""}
          style={{
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "10px 12px",
            background: "var(--surface2)",
          }}
        />
        <select
          name="featured"
          defaultValue={featured ?? ""}
          style={{
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "10px 12px",
            background: "var(--surface2)",
          }}
        >
          <option value="">Any</option>
          <option value="true">Featured only</option>
        </select>
        <button
          type="submit"
          style={{
            gridColumn: "1 / -1",
            borderRadius: 12,
            padding: "10px 12px",
            border: "1px solid var(--border)",
            background: "color-mix(in oklab, var(--brand) 16%, var(--surface2))",
            cursor: "pointer",
          }}
        >
          Apply filters
        </button>
      </form>

      {listings.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>No listings found.</p>
      ) : (
        <div className={styles.grid}>
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}

      <p style={{ marginTop: 14, color: "var(--muted)", fontSize: 13 }}>
        Tip: category browsing also lives on <Link href="/category">/category</Link>.
      </p>
    </div>
  );
}
