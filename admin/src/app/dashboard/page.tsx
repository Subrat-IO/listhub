import { serverApiFetch } from "@/lib/server-api";
import styles from "@/styles/admin.module.css";

export const dynamic = "force-dynamic";

type Dashboard = {
  totals: { users: number; activeListings: number; openReports: number; pendingInterests: number };
  last7Days: { newUsers: number; newListings: number };
  recentAudit: {
    id: string;
    action: string;
    createdAt: string;
    actor?: { profile?: { displayName?: string | null } | null } | null;
  }[];
};

export default async function DashboardPage() {
  let data: Dashboard | null = null;
  let error: string | null = null;
  try {
    data = await serverApiFetch<Dashboard>(`/admin/dashboard`);
  } catch {
    error = "Unauthorized or API unavailable. Sign in at /login with a staff account.";
  }

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 10 }}>Dashboard</h1>
      {error ? (
        <div className={styles.panel} style={{ color: "var(--danger)" }}>
          {error}
        </div>
      ) : data ? (
        <>
          <div className={styles.grid}>
            <div className={styles.panel}>
              <div style={{ color: "var(--muted)", fontSize: 12 }}>Users</div>
              <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6 }}>{data.totals.users}</div>
            </div>
            <div className={styles.panel}>
              <div style={{ color: "var(--muted)", fontSize: 12 }}>Active listings</div>
              <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6 }}>{data.totals.activeListings}</div>
            </div>
            <div className={styles.panel}>
              <div style={{ color: "var(--muted)", fontSize: 12 }}>Open reports</div>
              <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6 }}>{data.totals.openReports}</div>
            </div>
            <div className={styles.panel}>
              <div style={{ color: "var(--muted)", fontSize: 12 }}>Pending interests</div>
              <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6 }}>{data.totals.pendingInterests}</div>
            </div>
            <div className={styles.panel}>
              <div style={{ color: "var(--muted)", fontSize: 12 }}>New users (7d)</div>
              <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6 }}>{data.last7Days.newUsers}</div>
            </div>
            <div className={styles.panel}>
              <div style={{ color: "var(--muted)", fontSize: 12 }}>New listings (7d)</div>
              <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6 }}>{data.last7Days.newListings}</div>
            </div>
          </div>

          <div className={styles.panel} style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 800, marginBottom: 10 }}>Recent audit events</div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>When</th>
                  <th>Actor</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.recentAudit.map((a) => (
                  <tr key={a.id}>
                    <td style={{ whiteSpace: "nowrap" }}>{new Date(a.createdAt).toLocaleString()}</td>
                    <td>{a.actor?.profile?.displayName ?? "—"}</td>
                    <td>{a.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );
}
