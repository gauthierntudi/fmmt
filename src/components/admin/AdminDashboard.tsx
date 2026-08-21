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

function StatIcon({ kind }: { kind: "total" | "participant" | "artiste" | "media" }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (kind === "total") {
    return (
      <svg {...common}>
        <path d="M3 3v18h18" />
        <path d="M7 14l3-3 3 2 5-6" />
      </svg>
    );
  }
  if (kind === "artiste") {
    return (
      <svg {...common}>
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    );
  }
  if (kind === "media") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
    </svg>
  );
}

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
    .filter((item) => item.id !== "dashboard" && canSeeNavItem(item, role) && !item.comingSoon)
    .slice(0, 4);

  const cards = [
    {
      label: "Total inscriptions",
      value: stats.total,
      hint: "Toutes catégories",
      kind: "total" as const,
    },
    {
      label: "Participants",
      value: stats.participant,
      hint: "Type PARTICIPANT",
      kind: "participant" as const,
    },
    {
      label: "Artistes",
      value: stats.artiste,
      hint: "Type ARTISTE",
      kind: "artiste" as const,
    },
    {
      label: "Officiels & médias",
      value: stats.officiel + stats.media,
      hint: "OFFICIEL + MEDIA",
      kind: "media" as const,
    },
  ];

  return (
    <>
      <div className="admin-stats-grid">
        {cards.map((card) => (
          <div key={card.label} className="admin-stat-card">
            <div className="admin-stat-head">
              <p className="admin-stat-label">{card.label}</p>
              <span className="admin-stat-icon">
                <StatIcon kind={card.kind} />
              </span>
            </div>
            <p className="admin-stat-value">{card.value}</p>
            <p className="admin-stat-hint">{card.hint}</p>
          </div>
        ))}
      </div>

      {shortcuts.length > 0 && (
        <div className="admin-quick-row">
          {shortcuts.map((item) => (
            <Link key={item.id} href={item.href} className="admin-quick-chip">
              {item.label}
            </Link>
          ))}
        </div>
      )}

      <div className="admin-panel admin-panel-table">
        <div className="admin-panel-toolbar">
          <div>
            <h2>Dernières inscriptions</h2>
            <p className="admin-panel-sub">Activité récente sur le formulaire public</p>
          </div>
          <div className="admin-panel-actions">
            <Link href="/admin/participants" className="admin-btn admin-btn-secondary">
              Voir tout
            </Link>
            <a href="/api/admin/participants/export" className="admin-btn admin-btn-primary">
              Export
            </a>
          </div>
        </div>

        {recent.length === 0 ? (
          <p className="admin-empty">Aucune inscription pour le moment.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Pays</th>
                  <th>Type</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id}>
                    <td className="admin-cell-strong">
                      {r.prenom} {r.nom}
                    </td>
                    <td>{r.email}</td>
                    <td>{r.paysNom}</td>
                    <td>
                      <span className="admin-pill">{r.typeInscription}</span>
                    </td>
                    <td>{new Date(r.createdAt).toLocaleString("fr-FR")}</td>
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
