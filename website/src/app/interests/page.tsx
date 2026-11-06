import Link from "next/link";
import { redirect } from "next/navigation";
import { serverApiFetch } from "@/lib/server-api";
import { SellerInterestActions } from "./InterestActions";
import styles from "../home.module.css";
import localStyles from "./interests.module.css";

export const dynamic = "force-dynamic";

type Interest = {
  id: string;
  status: string;
  acceptedTerms: boolean;
  createdAt: string;
  listing: { id: string; title: string; askingPrice: string; currency: string };
  buyer?: { profile?: { displayName: string } | null };
};

type BuyerResp = { interests: Interest[] };
type SellerResp = { interests: Interest[] };

export default async function InterestsPage() {
  let buyer: Interest[] = [];
  let seller: Interest[] = [];
  try {
    const [b, s] = await Promise.all([
      serverApiFetch<BuyerResp>(`/me/interests`),
      serverApiFetch<SellerResp>(`/me/received-interests`),
    ]);
    buyer = b.interests;
    seller = s.interests;
  } catch {
    redirect("/login?next=/interests");
  }

  return (
    <div>
      <div className={styles.gridTitleRow}>
        <div className={styles.gridTitle}>Interests</div>
        <div className={styles.gridSub}>Buyer &amp; seller workflows</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 12 }}>
        <section className={localStyles.panel}>
          <div style={{ fontWeight: 800, marginBottom: 10 }}>My expressed interests</div>
          {buyer.length === 0 ? (
            <div style={{ color: "var(--muted)" }}>None yet.</div>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {buyer.map((i) => (
                <li key={i.id} style={{ marginTop: 8 }}>
                  <Link href={`/listing/${i.listing.id}`} style={{ textDecoration: "underline" }}>
                    {i.listing.title}
                  </Link>{" "}
                  — <span style={{ color: "var(--muted)" }}>{i.status}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={localStyles.panel}>
          <div style={{ fontWeight: 800, marginBottom: 10 }}>Received on my listings</div>
          {seller.length === 0 ? (
            <div style={{ color: "var(--muted)" }}>None yet.</div>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {seller.map((i) => (
                <li key={i.id} style={{ marginTop: 8 }}>
                  <div>
                    <strong>{i.buyer?.profile?.displayName ?? "Buyer"}</strong> on{" "}
                    <Link href={`/listing/${i.listing.id}`} style={{ textDecoration: "underline" }}>
                      {i.listing.title}
                    </Link>
                  </div>
                  <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>Status: {i.status}</div>
                  <SellerInterestActions listingId={i.listing.id} interestId={i.id} status={i.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

    </div>
  );
}
