import Link from "next/link";
import type { ReactNode } from "react";
import { publicEnv } from "@/lib/env";
import styles from "./app-shell.module.css";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          {publicEnv.appName}
        </Link>
        <nav className={styles.nav}>
          <Link href="/explore">Explore</Link>
          <Link href="/category">Categories</Link>
          <Link href="/sell">Sell</Link>
          <Link href="/messages">Messages</Link>
          <Link href="/account">Account</Link>
        </nav>
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <span>© {new Date().getFullYear()} {publicEnv.appName}</span>
      </footer>
    </div>
  );
}
