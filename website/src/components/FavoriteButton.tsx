"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import styles from "./listing-card.module.css";

export function FavoriteButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  async function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await apiFetch("/favorites", {
        method: "POST",
        body: JSON.stringify({ listingId }),
      });
      setSaved(true);
      router.refresh();
    } catch {
      router.push(`/login?next=/listing/${listingId}`);
    }
  }

  return (
    <button type="button" className={styles.heart} aria-label="Save listing" onClick={onClick}>
      {saved ? "♥" : "♡"}
    </button>
  );
}
