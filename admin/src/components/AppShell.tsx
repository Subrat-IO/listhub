import Link from "next/link";
import type { ReactNode } from "react";
import { publicEnv } from "@/lib/env";
import styles from "@/styles/admin.module.css";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <header className={styles.top}>
        <Link href="/dashboard" className={styles.brand}>
          {publicEnv.appName}
        </Link>
        <nav className={styles.nav}>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/users">Users</Link>
          <Link href="/listings">Listings</Link>
          <Link href="/categories">Categories</Link>
          <Link href="/reports">Reports</Link>
          <Link href="/moderation">Moderation</Link>
          <Link href="/featured">Featured</Link>
          <Link href="/analytics">Analytics</Link>
          <Link href="/audit-logs">Audit logs</Link>
          <Link href="/settings">Settings</Link>
          <Link href="/login">Login</Link>
        </nav>
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>Admin access is enforced server-side — UI visibility is not security.</footer>
    </div>
  );
}
