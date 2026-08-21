"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "STAFF";
  active: boolean;
  createdAt: string;
};

export function UsersManager({
  initial,
  currentUserId,
}: {
  initial: UserRow[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [users, setUsers] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STAFF" as "SUPER_ADMIN" | "STAFF",
  });

  async function refresh() {
    const res = await fetch("/api/admin/users");
    if (!res.ok) return;
    const json = await res.json();
    setUsers(
      (json.users as UserRow[]).map((u) => ({
        ...u,
        createdAt: typeof u.createdAt === "string" ? u.createdAt : String(u.createdAt),
      })),
    );
    router.refresh();
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.error === "DUPLICATE_EMAIL") setError("Cet email existe déjà");
        else if (json.error === "INVALID_PAYLOAD")
          setError("Nom, email et mot de passe (≥ 8) requis");
        else setError("Création impossible");
        return;
      }
      setForm({ name: "", email: "", password: "", role: "STAFF" });
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function patchUser(id: string, body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const json = await res.json();
        if (json.error === "CANNOT_DISABLE_SELF") setError("Vous ne pouvez pas vous désactiver");
        else if (json.error === "CANNOT_DEMOTING_SELF")
          setError("Vous ne pouvez pas vous rétrograder");
        else setError("Mise à jour impossible");
        return;
      }
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function deleteUser(id: string) {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!res.ok) {
        setError("Suppression impossible");
        return;
      }
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="panel" style={{ marginBottom: "1.25rem" }}>
        <h2 style={{ marginTop: 0, fontFamily: "cb, sans-serif" }}>Nouvel utilisateur</h2>
        {error && <div className="form-error-banner">{error}</div>}
        <form onSubmit={createUser} className="admin-user-form">
          <input
            placeholder="Nom"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
          <input
            type="password"
            placeholder="Mot de passe (≥ 8)"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            required
            minLength={8}
          />
          <select
            value={form.role}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                role: e.target.value as "SUPER_ADMIN" | "STAFF",
              }))
            }
            className="admin-select"
          >
            <option value="STAFF">Staff</option>
            <option value="SUPER_ADMIN">Super admin</option>
          </select>
          <button type="submit" className="btn btn-primary trapezoid" disabled={busy} style={{ fontSize: "1em" }}>
            Créer
          </button>
        </form>
      </div>

      <div className="panel table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ opacity: u.active ? 1 : 0.55 }}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role === "SUPER_ADMIN" ? "Super admin" : "Staff"}</td>
                <td>{u.active ? "Actif" : "Inactif"}</td>
                <td>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className="btn btn-secondary trapezoid"
                      style={{ fontSize: "0.8em", padding: "0.4rem 0.8rem" }}
                      disabled={busy || u.id === currentUserId}
                      onClick={() =>
                        void patchUser(u.id, {
                          role: u.role === "SUPER_ADMIN" ? "STAFF" : "SUPER_ADMIN",
                        })
                      }
                    >
                      {u.role === "SUPER_ADMIN" ? "→ Staff" : "→ Super"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary trapezoid"
                      style={{ fontSize: "0.8em", padding: "0.4rem 0.8rem" }}
                      disabled={busy || u.id === currentUserId}
                      onClick={() => void patchUser(u.id, { active: !u.active })}
                    >
                      {u.active ? "Désactiver" : "Activer"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary trapezoid"
                      style={{ fontSize: "0.8em", padding: "0.4rem 0.8rem", background: "#c62828" }}
                      disabled={busy || u.id === currentUserId}
                      onClick={() => void deleteUser(u.id)}
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
