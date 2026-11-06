import { notFound } from "next/navigation";
import { ListingCard } from "@/components/ListingCard";
import { serverApiFetch } from "@/lib/server-api";
import type { Category, Listing } from "@/lib/types";
import styles from "../../home.module.css";

export const dynamic = "force-dynamic";

type CategoriesResponse = { categories: Category[] };
type ListingsResponse = { listings: Listing[]; total: number };

export default async function CategorySlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let category: Category | undefined;
  try {
    const res = await serverApiFetch<CategoriesResponse>("/categories");
    category = res.categories.find((c) => c.slug === slug);
  } catch {
    category = undefined;
  }
  if (!category) notFound();

  let listings: Listing[] = [];
  try {
    const res = await serverApiFetch<ListingsResponse>(`/listings?categoryId=${category.id}&pageSize=24`);
    listings = res.listings;
  } catch {
    listings = [];
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>{category.name}</h1>
      <p style={{ color: "var(--secondary)" }}>{category.description}</p>
      <div className={styles.grid}>
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
      {listings.length === 0 ? <p style={{ color: "var(--secondary)" }}>No ads in this category yet.</p> : null}
    </div>
  );
}
