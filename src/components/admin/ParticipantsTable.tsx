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
}: {
  initial: ParticipantRow[];
  initialQuery: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const [selected, setSelected] = useState<ParticipantRow | null>(null);

  const rows = useMemo(() => initial, [initial]);

  function search(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    router.push(`/admin/participants?${params.toString()}`);
  }

  return (
    <>
      <div className="admin-toolbar">
        <form onSubmit={search} style={{ display: "flex", gap: 8, flex: 1 }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher (nom, email…)"
          />
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
          <p>Aucun participant</p>
        ) : (
          <table className="data">
            <thead>
              <tr>
                <th>Date</th>
                <th>Nom</th>
                <th>Email</th>
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
            <div className="form-actions">
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
