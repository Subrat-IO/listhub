import Link from "next/link";
import { notFound } from "next/navigation";
import { serverApiFetch } from "@/lib/server-api";
import type { Listing } from "@/lib/types";
import { ListingActions } from "./ListingActions";
import styles from "../../home.module.css";

export const dynamic = "force-dynamic";

type Resp = { listing: Listing };

function money(listing: Listing) {
  const n = Number(listing.askingPrice);
  if (Number.isNaN(n)) return `${listing.askingPrice} ${listing.currency}`;
  return new Intl.NumberFormat(undefined, { style: "currency", currency: listing.currency || "USD" }).format(n);
}

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let listing: Listing | null = null;
  try {
    const res = await serverApiFetch<Resp>(`/listings/${id}`);
    listing = res.listing;
  } catch {
    listing = null;
  }

  if (!listing) notFound();

  const img = listing.images[0]?.url;

  return (
    <div>
      <div className={styles.gridTitleRow}>
        <div className={styles.gridTitle}>{listing.title}</div>
        <div className={styles.gridSub}>
          <Link href={`/explore?categoryId=${listing.category.id}`}>More in {listing.category.name}</Link>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 14 }}>
        <div>
          <div
            style={{
              borderRadius: 16,
              border: "1px solid var(--border)",
              minHeight: 320,
              backgroundImage: img ? `url(${img})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundColor: "var(--surface2)",
            }}
          />

          <div style={{ marginTop: 12, border: "1px solid var(--border)", borderRadius: 14, padding: 14, background: "var(--surface)" }}>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{money(listing)}</div>
            <div style={{ marginTop: 8, color: "var(--muted)", fontSize: 13 }}>
              {listing.location ?? "Location not specified"} · {listing.status}
            </div>
            <p style={{ marginTop: 14, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{listing.description}</p>
          </div>

          <div style={{ marginTop: 12, border: "1px solid var(--border)", borderRadius: 14, padding: 14, background: "var(--surface)" }}>
            <div style={{ fontWeight: 750 }}>Additional disclosed charges</div>
            {listing.fees.length === 0 ? (
              <div style={{ color: "var(--muted)", marginTop: 8 }}>None listed.</div>
            ) : (
              <ul style={{ marginTop: 10, paddingLeft: 18 }}>
                {listing.fees.map((f) => (
                  <li key={`${f.label}-${f.amount}`} style={{ marginTop: 6 }}>
                    <strong>{f.label}</strong>: {f.amount} {f.currency}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ marginTop: 12, border: "1px solid var(--border)", borderRadius: 14, padding: 14, background: "var(--surface)" }}>
            <div style={{ fontWeight: 750 }}>Seller terms</div>
            {listing.terms.length === 0 ? (
              <div style={{ color: "var(--muted)", marginTop: 8 }}>No explicit terms were added.</div>
            ) : (
              <ol style={{ marginTop: 10, paddingLeft: 18 }}>
                {listing.terms.map((t) => (
                  <li key={t.content.slice(0, 24)} style={{ marginTop: 8, lineHeight: 1.45 }}>
                    {t.content}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        <ListingActions listingId={listing.id} sellerId={listing.seller.id} terms={listing.terms} />
      </div>

    </div>
  );
}
