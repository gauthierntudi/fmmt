"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSelect } from "@/components/admin/AdminSelect";

const ROLE_OPTIONS = [
  { value: "STAFF", label: "Staff" },
  { value: "SUPER_ADMIN", label: "Super admin" },
];

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  role: "STAFF" as "SUPER_ADMIN" | "STAFF",
};

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
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!openCreate) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeCreate();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [openCreate]);

  function openCreateModal() {
    setForm(EMPTY_FORM);
    setFormError(null);
    setOpenCreate(true);
  }

  function closeCreate() {
    if (busy) return;
    setOpenCreate(false);
    setFormError(null);
  }

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
    setFormError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.error === "DUPLICATE_EMAIL") setFormError("Cet email existe déjà");
        else if (json.error === "INVALID_PAYLOAD")
          setFormError("Nom, email et mot de passe (≥ 8) requis");
        else setFormError("Création impossible");
        return;
      }
      setForm(EMPTY_FORM);
      setOpenCreate(false);
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
      <div className="admin-panel-toolbar">
        <p className="admin-panel-sub" style={{ margin: 0 }}>
          {users.length} compte{users.length > 1 ? "s" : ""}
        </p>
        <div className="admin-panel-actions">
          <button type="button" className="admin-btn admin-btn-primary" onClick={openCreateModal}>
            Ajouter un utilisateur
          </button>
        </div>
      </div>

      {error && <div className="admin-form-error">{error}</div>}

      <div className="admin-panel admin-table-wrap">
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
                  <div className="admin-row-actions">
                    <button
                      type="button"
                      className="admin-icon-btn admin-icon-btn-circle"
                      disabled={busy || u.id === currentUserId}
                      title={
                        u.role === "SUPER_ADMIN"
                          ? "Passer en Staff"
                          : "Passer en Super admin"
                      }
                      aria-label={
                        u.role === "SUPER_ADMIN"
                          ? "Passer en Staff"
                          : "Passer en Super admin"
                      }
                      onClick={() =>
                        void patchUser(u.id, {
                          role: u.role === "SUPER_ADMIN" ? "STAFF" : "SUPER_ADMIN",
                        })
                      }
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                        <path d="M16 3h5v5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M8 21H3v-5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M21 3l-7.5 7.5" strokeLinecap="round" />
                        <path d="M3 21l7.5-7.5" strokeLinecap="round" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="admin-icon-btn admin-icon-btn-circle"
                      disabled={busy || u.id === currentUserId}
                      title={u.active ? "Désactiver" : "Activer"}
                      aria-label={u.active ? "Désactiver" : "Activer"}
                      onClick={() => void patchUser(u.id, { active: !u.active })}
                    >
                      {u.active ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                          <circle cx="12" cy="12" r="9" />
                          <path d="M9 9l6 6M15 9l-6 6" strokeLinecap="round" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                          <circle cx="12" cy="12" r="9" />
                          <path d="M8.5 12.5l2.5 2.5 4.5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                    <button
                      type="button"
                      className="admin-icon-btn admin-icon-btn-circle admin-icon-btn-danger"
                      disabled={busy || u.id === currentUserId}
                      title="Supprimer"
                      aria-label="Supprimer"
                      onClick={() => void deleteUser(u.id)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                        <path d="M4 7h16" strokeLinecap="round" />
                        <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" strokeLinecap="round" />
                        <path d="M7 7l1 12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2l1-12" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10 11v6M14 11v6" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openCreate && (
        <div className="modal-backdrop" onClick={closeCreate}>
          <div
            className="modal admin-user-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-user-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="admin-user-modal-title">Nouvel utilisateur</h2>
            <p className="admin-panel-sub">Créez un compte staff ou super admin.</p>

            {formError && <div className="admin-form-error">{formError}</div>}

            <form onSubmit={createUser} className="admin-user-form admin-user-form-modal">
              <label className="admin-field">
                <span>Nom</span>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  autoFocus
                />
              </label>
              <label className="admin-field">
                <span>Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
              </label>
              <label className="admin-field">
                <span>Mot de passe</span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                  minLength={8}
                  placeholder="Au moins 8 caractères"
                />
              </label>
              <label className="admin-field">
                <span>Rôle</span>
                <AdminSelect
                  value={form.role}
                  onChange={(role) =>
                    setForm((f) => ({
                      ...f,
                      role: role as "SUPER_ADMIN" | "STAFF",
                    }))
                  }
                  options={ROLE_OPTIONS}
                  aria-label="Rôle"
                />
              </label>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={closeCreate}
                  disabled={busy}
                >
                  Annuler
                </button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={busy}>
                  {busy ? "Création…" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
