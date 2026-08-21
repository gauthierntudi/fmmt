"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AdminSession } from "@/lib/auth";

export function AdminShell({
  user,
  active,
  children,
}: {
  user: AdminSession;
  active: "participants" | "users";
  children: React.ReactNode;
}) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="admin-shell">
      <header className="admin-top">
        <div>
          <div className="brand-mark">FMMT Admin</div>
          <p className="brand-sub">
            {user.name} · {user.role === "SUPER_ADMIN" ? "Super admin" : "Staff"}
          </p>
        </div>
        <nav className="admin-nav">
          <Link
            href="/admin/participants"
            className={active === "participants" ? "admin-nav-link active" : "admin-nav-link"}
          >
            Inscriptions
          </Link>
          {user.role === "SUPER_ADMIN" && (
            <Link
              href="/admin/users"
              className={active === "users" ? "admin-nav-link active" : "admin-nav-link"}
            >
              Utilisateurs
            </Link>
          )}
          <button
            type="button"
            className="btn btn-secondary trapezoid"
            style={{ fontSize: "0.95em" }}
            onClick={() => void logout()}
          >
            Déconnexion
          </button>
        </nav>
      </header>
      {children}
    </div>
  );
}
