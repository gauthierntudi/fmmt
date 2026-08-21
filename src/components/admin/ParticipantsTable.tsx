"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ParticipantRow = {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  typeInscription: string;
  paysNom: string;
  telephone: string;
  fonction: string;
  societe: string | null;
  lettreInvitation: string;
  locale: string;
  createdAt: string;
  voyage: {
    typeAcces: string;
    dateArrivee: string | null;
    heureArrivee: string | null;
    dateDepart: string | null;
    heureDepart: string | null;
    compagnieAerienne: string | null;
    numeroVol: string | null;
  } | null;
  hebergement: {
    hotel: string;
    roomType: string | null;
    price: string | null;
    distance: string | null;
  } | null;
};

export function ParticipantsTable({
  initial,
  initialQuery,
  initialType,
  total,
  page,
  pageSize,
  canDelete,
}: {
  initial: ParticipantRow[];
  initialQuery: string;
  initialType: string;
  total: number;
  page: number;
  pageSize: number;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const [type, setType] = useState(initialType);
  const [selected, setSelected] = useState<ParticipantRow | null>(null);
  const [busy, setBusy] = useState(false);

  const rows = useMemo(() => initial, [initial]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function pushFilters(nextPage = 1) {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (type) params.set("type", type);
    if (nextPage > 1) params.set("page", String(nextPage));
    router.push(`/admin/participants?${params.toString()}`);
  }

  function search(e: React.FormEvent) {
    e.preventDefault();
    pushFilters(1);
  }

  async function removeParticipant(id: string) {
    if (!canDelete) return;
    if (!confirm("Supprimer cette inscription ?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/participants?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        alert("Suppression impossible");
        return;
      }
      setSelected(null);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="admin-stats">
        <strong>{total}</strong> inscription{total > 1 ? "s" : ""}
      </div>

      <div className="admin-toolbar">
        <form onSubmit={search} style={{ display: "flex", gap: 8, flex: 1, flexWrap: "wrap" }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher (nom, email, téléphone, pays…)"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="admin-select"
          >
            <option value="">Tous les types</option>
            <option value="PARTICIPANT">Participant</option>
            <option value="ARTISTE">Artiste</option>
            <option value="OFFICIEL">Officiel</option>
            <option value="MEDIA">Média</option>
          </select>
          <button type="submit" className="btn btn-secondary trapezoid" style={{ fontSize: "1em" }}>
            Filtrer
          </button>
        </form>
        <button
          type="button"
          className="btn btn-success-2 trapezoid"
          style={{ fontSize: "1em" }}
          onClick={() => {
            window.location.href = "/api/admin/participants/export";
          }}
        >
          Exporter Excel
        </button>
      </div>

      <div className="panel table-wrap">
        {rows.length === 0 ? (
          <p>Aucune inscription</p>
        ) : (
          <table className="data">
            <thead>
              <tr>
                <th>Date</th>
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Pays</th>
                <th>Type</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td>{new Date(p.createdAt).toLocaleString("fr-FR")}</td>
                  <td>
                    {p.prenom} {p.nom}
                  </td>
                  <td>{p.email}</td>
                  <td>{p.telephone}</td>
                  <td>{p.paysNom}</td>
                  <td>{p.typeInscription}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-primary trapezoid"
                      style={{ fontSize: "0.85em", padding: "0.45rem 1rem" }}
                      onClick={() => setSelected(p)}
                    >
                      Détail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="admin-pagination">
          <button
            type="button"
            className="btn btn-secondary trapezoid"
            style={{ fontSize: "0.9em" }}
            disabled={page <= 1}
            onClick={() => pushFilters(page - 1)}
          >
            Précédent
          </button>
          <span>
            Page {page} / {totalPages}
          </span>
          <button
            type="button"
            className="btn btn-secondary trapezoid"
            style={{ fontSize: "0.9em" }}
            disabled={page >= totalPages}
            onClick={() => pushFilters(page + 1)}
          >
            Suivant
          </button>
        </div>
      )}

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>
              {selected.prenom} {selected.nom}
            </h2>
            <dl>
              <dt>Email</dt>
              <dd>{selected.email}</dd>
              <dt>Téléphone</dt>
              <dd>{selected.telephone}</dd>
              <dt>Fonction</dt>
              <dd>{selected.fonction}</dd>
              <dt>Société</dt>
              <dd>{selected.societe || "—"}</dd>
              <dt>Pays</dt>
              <dd>{selected.paysNom}</dd>
              <dt>Type</dt>
              <dd>{selected.typeInscription}</dd>
              <dt>Lettre</dt>
              <dd>{selected.lettreInvitation}</dd>
              <dt>Locale</dt>
              <dd>{selected.locale}</dd>
              {selected.voyage && (
                <>
                  <dt>Accès</dt>
                  <dd>{selected.voyage.typeAcces}</dd>
                  <dt>Arrivée</dt>
                  <dd>
                    {selected.voyage.dateArrivee
                      ? new Date(selected.voyage.dateArrivee).toLocaleDateString("fr-FR")
                      : "—"}{" "}
                    {selected.voyage.heureArrivee || ""}
                  </dd>
                  <dt>Départ</dt>
                  <dd>
                    {selected.voyage.dateDepart
                      ? new Date(selected.voyage.dateDepart).toLocaleDateString("fr-FR")
                      : "—"}{" "}
                    {selected.voyage.heureDepart || ""}
                  </dd>
                  <dt>Vol</dt>
                  <dd>
                    {selected.voyage.compagnieAerienne || "—"} {selected.voyage.numeroVol || ""}
                  </dd>
                </>
              )}
              {selected.hebergement && (
                <>
                  <dt>Hôtel</dt>
                  <dd>{selected.hebergement.hotel}</dd>
                  <dt>Chambre</dt>
                  <dd>{selected.hebergement.roomType || "—"}</dd>
                  <dt>Prix</dt>
                  <dd>{selected.hebergement.price || "—"}</dd>
                  <dt>Distance</dt>
                  <dd>{selected.hebergement.distance || "—"}</dd>
                </>
              )}
            </dl>
            <div className="form-actions" style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              {canDelete && (
                <button
                  type="button"
                  className="btn btn-secondary trapezoid"
                  style={{ fontSize: "0.95em", background: "#c62828" }}
                  disabled={busy}
                  onClick={() => void removeParticipant(selected.id)}
                >
                  Supprimer
                </button>
              )}
              <button type="button" className="btn btn-secondary trapezoid" onClick={() => setSelected(null)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
