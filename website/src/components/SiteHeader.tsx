"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { CITIES, HEADER_CHIPS } from "@/lib/catalog";
import styles from "./site-header.module.css";

export function SiteHeader({ city }: { city: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState(city);

  function onCity(next: string) {
    setSelectedCity(next);
    document.cookie = `listhub_city=${encodeURIComponent(next)}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (selectedCity) params.set("location", selectedCity);
    router.push(`/explore?${params.toString()}`);
  }

  return (
    <header className={styles.wrap}>
      <div className={styles.top}>
        <Link href="/" className={styles.logoLink} aria-label="ListHub home">
          <img src="/listhub-logo.jpg" alt="ListHub — Sell anything at your own price" className={styles.logo} />
        </Link>

        <label className={styles.city}>
          <span className={styles.pin} aria-hidden>
            ⌖
          </span>
          <select value={selectedCity} onChange={(e) => onCity(e.target.value)} aria-label="City">
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <form className={styles.search} onSubmit={onSearch}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for cars, bikes, phones, furniture…"
            aria-label="Search listings"
          />
          <button type="submit" aria-label="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="2" />
              <path d="M20 20L16.5 16.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </form>

        <nav className={styles.actions}>
          <Link href="/favorites" className={styles.ghost}>
            <span aria-hidden>♡</span> Wishlist
          </Link>
          <Link href="/account" className={styles.ghost}>
            <span aria-hidden>☺</span> Profile
          </Link>
          <Link href="/sell" className={styles.post}>
            + Post Ad
          </Link>
        </nav>
      </div>

      <div className={styles.chips}>
        {HEADER_CHIPS.map((chip) => (
          <Link key={chip.label} href={chip.slug ? `/category/${chip.slug}` : "/explore"} className={styles.chip}>
            {chip.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
