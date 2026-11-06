import Link from "next/link";
import { cookies } from "next/headers";
import { ListingCard } from "@/components/ListingCard";
import { BROWSE_TILES } from "@/lib/catalog";
import { serverApiFetch } from "@/lib/server-api";
import type { Category, Listing } from "@/lib/types";
import styles from "./home.module.css";

export const dynamic = "force-dynamic";

type ListingsResponse = { listings: Listing[] };
type CategoriesResponse = { categories: Category[] };

export default async function HomePage() {
  const jar = await cookies();
  const city = jar.get("listhub_city")?.value
    ? decodeURIComponent(jar.get("listhub_city")!.value)
    : "Bengaluru";

  let listings: Listing[] = [];
  let categories: Category[] = [];
  try {
    const [listRes, catRes] = await Promise.all([
      serverApiFetch<ListingsResponse>(`/listings?pageSize=16&location=${encodeURIComponent(city)}`),
      serverApiFetch<CategoriesResponse>("/categories"),
    ]);
    listings = listRes.listings;
    categories = catRes.categories;
  } catch {
    try {
      const listRes = await serverApiFetch<ListingsResponse>("/listings?pageSize=16");
      listings = listRes.listings;
    } catch {
      listings = [];
    }
  }

  const bySlug = new Map(categories.map((c) => [c.slug, c.id]));

  return (
    <div>
      <section className={styles.hero}>
        <div>
          <h1>
            Sell Anything at Your Own Price
            <span>Buy and sell anything near you</span>
          </h1>
          <p>Cars, bikes, phones, furniture and more in {city}.</p>
          <Link href="/explore" className={styles.cta}>
            Browse Listings →
          </Link>
        </div>
        <div className={styles.art} aria-hidden>
          <div className={styles.phone}>
            <div className={styles.tag}>₹</div>
          </div>
          <div className={styles.skyline} />
        </div>
      </section>

      <section className={styles.section}>
        <h2>Browse by Category</h2>
        <div className={styles.tiles}>
          {BROWSE_TILES.map((tile) => {
            const id = bySlug.get(tile.slug);
            const href = id ? `/explore?categoryId=${id}` : `/category/${tile.slug}`;
            return (
              <Link key={tile.slug} href={href} className={styles.tile}>
                <span className={styles.icon} style={{ background: tile.tint }}>
                  {tile.emoji}
                </span>
                <span>{tile.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className={styles.section}>
        <h2>Fresh recommendations</h2>
        {listings.length === 0 ? (
          <p className={styles.empty}>No listings in {city} yet. Post an ad or browse all of India.</p>
        ) : (
          <div className={styles.grid}>
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
        <div className={styles.moreWrap}>
          <Link href={`/explore?location=${encodeURIComponent(city)}`} className={styles.more}>
            Load more
          </Link>
        </div>
      </section>
    </div>
  );
}
