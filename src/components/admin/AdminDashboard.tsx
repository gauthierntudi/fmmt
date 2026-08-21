import Link from "next/link";
import type { AdminRole } from "@prisma/client";
import { adminNavGroups, canSeeNavItem } from "@/lib/admin-nav";

type Recent = {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  typeInscription: string;
  paysNom: string;
  createdAt: string;
};

export function AdminDashboard({
  role,
  stats,
  recent,
}: {
  role: AdminRole;
  stats: {
    total: number;
    participant: number;
    artiste: number;
    officiel: number;
    media: number;
  };
  recent: Recent[];
}) {
  const shortcuts = adminNavGroups
    .flatMap((g) => g.items)
    .filter((item) => item.id !== "dashboard" && canSeeNavItem(item, role))
    .slice(0, 6);

  return (
    <>
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <p className="admin-stat-label">Total inscriptions</p>
          <p className="admin-stat-value">{stats.total}</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Participants</p>
          <p className="admin-stat-value">{stats.participant}</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Artistes</p>
          <p className="admin-stat-value">{stats.artiste}</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Officiels / Médias</p>
          <p className="admin-stat-value">{stats.officiel + stats.media}</p>
        </div>
      </div>

      <div className="admin-panel">
        <h2>Modules</h2>
        <div className="admin-quick-grid">
          {shortcuts.map((item) =>
            item.comingSoon ? (
              <div key={item.id} className="admin-quick-card is-disabled">
                <h3>{item.label}</h3>
                <p>{item.description} — bientôt</p>
              </div>
            ) : (
              <Link key={item.id} href={item.href} className="admin-quick-card">
                <h3>{item.label}</h3>
                <p>{item.description}</p>
              </Link>
            ),
          )}
        </div>
      </div>

      <div className="admin-panel" style={{ marginTop: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>Dernières inscriptions</h2>
          <Link href="/admin/participants" className="admin-btn admin-btn-secondary">
            Tout voir
          </Link>
        </div>
        {recent.length === 0 ? (
          <p style={{ color: "#6b5b64", marginTop: "1rem" }}>Aucune inscription pour le moment.</p>
        ) : (
          <div className="admin-table-wrap" style={{ marginTop: "0.85rem" }}>
            <table className="data">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Pays</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id}>
                    <td>{new Date(r.createdAt).toLocaleString("fr-FR")}</td>
                    <td>
                      {r.prenom} {r.nom}
                    </td>
                    <td>{r.email}</td>
                    <td>{r.paysNom}</td>
                    <td>{r.typeInscription}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
