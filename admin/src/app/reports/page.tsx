import { serverApiFetch } from "@/lib/server-api";
import styles from "@/styles/admin.module.css";
import { ReportActions } from "./report-actions";

export const dynamic = "force-dynamic";

type Report = {
  id: string;
  status: string;
  reason: string;
  createdAt: string;
  reporter: { email: string };
  listing?: { id: string; title: string } | null;
};

type Resp = { reports: Report[] };

export default async function ReportsPage() {
  let rows: Report[] = [];
  let error: string | null = null;
  try {
    const res = await serverApiFetch<Resp>(`/admin/reports?pageSize=50`);
    rows = res.reports;
  } catch {
    error = "Unauthorized or API unavailable.";
  }

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 10 }}>Reports</h1>
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
                <th>Reporter</th>
                <th>Listing</th>
                <th>Status</th>
                <th>Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td style={{ whiteSpace: "nowrap" }}>{new Date(r.createdAt).toLocaleString()}</td>
                  <td>{r.reporter.email}</td>
                  <td>{r.listing ? r.listing.title : "—"}</td>
                  <td>{r.status}</td>
                  <td style={{ maxWidth: 420 }}>{r.reason}</td>
                  <td>
                    <ReportActions reportId={r.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
