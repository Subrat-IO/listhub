"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./bottom-nav.module.css";

const ITEMS = [
  { href: "/explore", label: "Explore" },
  { href: "/favorites", label: "Saved" },
  { href: "/sell", label: "Post" },
  { href: "/messages", label: "Messages" },
  { href: "/account", label: "Account" },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className={styles.nav} aria-label="Mobile">
      {ITEMS.map((item) => {
        const active = path === item.href || path.startsWith(`${item.href}/`);
        return (
          <Link key={item.href} href={item.href} className={active ? styles.active : undefined}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
