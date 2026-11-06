import { serverApiFetch } from "@/lib/server-api";
import styles from "@/styles/admin.module.css";

export const dynamic = "force-dynamic";

type Analytics = {
  series: { day: string; newListings: number; newUsers: number; messages: number }[];
};

export default async function AnalyticsPage() {
  let series: Analytics["series"] = [];
  let error: string | null = null;
  try {
    const res = await serverApiFetch<Analytics>(`/admin/analytics?days=14`);
    series = res.series;
  } catch {
    error = "Unauthorized or API unavailable.";
  }

  return (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 10 }}>Analytics</h1>
      {error ? (
        <div className={styles.panel} style={{ color: "var(--danger)" }}>
          {error}
        </div>
      ) : (
        <div className={styles.panel}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Day</th>
                <th>New users</th>
                <th>New listings</th>
                <th>Messages</th>
              </tr>
            </thead>
            <tbody>
              {series.map((d) => (
                <tr key={d.day}>
                  <td style={{ whiteSpace: "nowrap" }}>{d.day}</td>
                  <td>{d.newUsers}</td>
                  <td>{d.newListings}</td>
                  <td>{d.messages}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
