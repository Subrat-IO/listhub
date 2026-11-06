"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { Category } from "@/lib/types";
import formStyles from "@/styles/forms.module.css";

export function SellListingForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [askingPrice, setAskingPrice] = useState("100");
  const [currency, setCurrency] = useState("USD");
  const [location, setLocation] = useState("");

  const [imageUrls, setImageUrls] = useState("");

  const [feeLabel, setFeeLabel] = useState("");
  const [feeAmount, setFeeAmount] = useState("");
  const [fees, setFees] = useState<{ label: string; amount: string; currency: string }[]>([]);

  const [termLine, setTermLine] = useState("");
  const [terms, setTerms] = useState<string[]>([]);

  const [attrs, setAttrs] = useState<Record<string, string>>({});

  const [error, setError] = useState<string | null>(null);

  const selectedCategory = useMemo(() => categories.find((c) => c.id === categoryId), [categories, categoryId]);

  function addFee() {
    if (!feeLabel || !feeAmount) return;
    setFees((prev) => [...prev, { label: feeLabel, amount: feeAmount, currency }]);
    setFeeLabel("");
    setFeeAmount("");
  }

  function addTerm() {
    if (!termLine) return;
    setTerms((prev) => [...prev, termLine]);
    setTermLine("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      const images = imageUrls
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const attributePayload: Record<string, string> = {};
      for (const a of selectedCategory?.attributes ?? []) {
        if (a.required && !attrs[a.id]) {
          setError(`Missing required attribute: ${a.label}`);
          return;
        }
        if (attrs[a.id]) attributePayload[a.id] = attrs[a.id]!;
      }

      const res = await apiFetch<{ listing: { id: string } }>(`/listings`, {
        method: "POST",
        body: JSON.stringify({
          categoryId,
          title,
          description,
          askingPrice,
          currency,
          location: location || undefined,
          imageUrls: images,
          fees,
          terms,
          attributes: attributePayload,
        }),
      });

      router.push(`/listing/${res.listing.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create listing");
    }
  }

  return (
    <form className={formStyles.card} onSubmit={submit}>
      <div className={formStyles.title}>Create a listing</div>
      <div className={formStyles.muted}>Set your asking price and disclose any extra charges up front.</div>

      <div className={formStyles.row}>
        <label className={formStyles.label}>Category</label>
        <select className={formStyles.select} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className={formStyles.row}>
        <label className={formStyles.label}>Title</label>
        <input className={formStyles.input} value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className={formStyles.row}>
        <label className={formStyles.label}>Description</label>
        <textarea className={formStyles.textarea} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className={formStyles.row} style={{ gridTemplateColumns: "1fr 120px", display: "grid", gap: 10 }}>
        <div>
          <label className={formStyles.label}>Asking price</label>
          <input className={formStyles.input} value={askingPrice} onChange={(e) => setAskingPrice(e.target.value)} />
        </div>
        <div>
          <label className={formStyles.label}>Currency</label>
          <input className={formStyles.input} value={currency} onChange={(e) => setCurrency(e.target.value)} maxLength={3} />
        </div>
      </div>

      <div className={formStyles.row}>
        <label className={formStyles.label}>Location</label>
        <input className={formStyles.input} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City / region" />
      </div>

      {selectedCategory?.attributes?.length ? (
        <div className={formStyles.row}>
          <div className={formStyles.label}>Category attributes</div>
          <div style={{ display: "grid", gap: 10 }}>
            {selectedCategory.attributes.map((a) => (
              <div key={a.id}>
                <div className={formStyles.label}>
                  {a.label} {a.required ? "(required)" : ""}
                </div>
                <input className={formStyles.input} value={attrs[a.id] ?? ""} onChange={(e) => setAttrs({ ...attrs, [a.id]: e.target.value })} />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className={formStyles.row}>
        <label className={formStyles.label}>Image URLs (one per line)</label>
        <textarea className={formStyles.textarea} value={imageUrls} onChange={(e) => setImageUrls(e.target.value)} />
      </div>

      <div className={formStyles.row}>
        <div className={formStyles.label}>Additional charges (fees)</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 140px auto", gap: 8, alignItems: "end" }}>
          <input className={formStyles.input} placeholder="Label (shipping, tax, etc.)" value={feeLabel} onChange={(e) => setFeeLabel(e.target.value)} />
          <input className={formStyles.input} placeholder="Amount" value={feeAmount} onChange={(e) => setFeeAmount(e.target.value)} />
          <button className={`${formStyles.btn} ${formStyles.btnSecondary}`} type="button" onClick={addFee}>
            Add
          </button>
        </div>
        {fees.length ? (
          <ul style={{ marginTop: 10, paddingLeft: 18 }}>
            {fees.map((f) => (
              <li key={`${f.label}-${f.amount}`} style={{ marginTop: 6 }}>
                <strong>{f.label}</strong>: {f.amount} {f.currency}
              </li>
            ))}
          </ul>
        ) : (
          <div className={formStyles.muted}>No extra fees added yet.</div>
        )}
      </div>

      <div className={formStyles.row}>
        <div className={formStyles.label}>Seller terms (bullets)</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "end" }}>
          <input className={formStyles.input} placeholder="Add a term line…" value={termLine} onChange={(e) => setTermLine(e.target.value)} />
          <button className={`${formStyles.btn} ${formStyles.btnSecondary}`} type="button" onClick={addTerm}>
            Add
          </button>
        </div>
        {terms.length ? (
          <ol style={{ marginTop: 10, paddingLeft: 18 }}>
            {terms.map((t) => (
              <li key={t} style={{ marginTop: 6 }}>
                {t}
              </li>
            ))}
          </ol>
        ) : (
          <div className={formStyles.muted}>Buyers must accept terms before expressing interest (recommended).</div>
        )}
      </div>

      <div className={formStyles.actions}>
        <button className={formStyles.btn} type="submit">
          Publish listing
        </button>
      </div>

      {error ? <div className={formStyles.error}>{error}</div> : null}
    </form>
  );
}
