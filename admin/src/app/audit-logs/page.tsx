import { serverApiFetch } from "@/lib/server-api";
import styles from "@/styles/admin.module.css";

export const dynamic = "force-dynamic";

type Audit = {
  id: string;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  createdAt: string;
  ip?: string | null;
  metadata?: string | null;
  actor?: { email: string; profile?: { displayName?: string | null } | null } | null;
};

type Resp = { logs: Audit[]; total: number };

export default async function AuditLogsPage() {
  let rows: Audit[] = [];
  let error: string | null = null;
  try {
    const res = await serverApiFetch<Resp>(`/admin/audit-logs?pageSize=100`);
    rows = res.logs;
  } catch {
    error = "Unauthorized or API unavailable.";
  }

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 10 }}>Audit logs</h1>
      {error ? (
        <div className={styles.panel} style={{ color: "var(--danger)" }}>
          {error}
        </div>
      ) : (
        <div className={styles.panel}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>When</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Entity</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id}>
                  <td style={{ whiteSpace: "nowrap" }}>{new Date(a.createdAt).toLocaleString()}</td>
                  <td>{a.actor?.profile?.displayName ?? a.actor?.email ?? "—"}</td>
                  <td>{a.action}</td>
                  <td>
                    {a.entityType ?? "—"} {a.entityId ? <code>{a.entityId}</code> : null}
                  </td>
                  <td>{a.ip ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
