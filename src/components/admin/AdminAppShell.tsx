"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { AdminSession } from "@/lib/auth";
import {
  adminNavGroups,
  canSeeNavItem,
  findNavItem,
} from "@/lib/admin-nav";

export function AdminAppShell({
  user,
  children,
}: {
  user: AdminSession;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const current = findNavItem(pathname);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className={`admin-app${open ? " is-nav-open" : ""}`}>
      <aside className="admin-sidebar" aria-label="Navigation admin">
        <div className="admin-sidebar-brand">
          <Image
            src="/img/logo-fr-01.png"
            alt="FMMT"
            width={140}
            height={48}
            className="admin-sidebar-logo"
            priority
          />
          <p className="admin-sidebar-edition">2e édition · 2026</p>
        </div>

        <nav className="admin-sidebar-nav">
          {adminNavGroups.map((group) => {
            const items = group.items.filter((item) => canSeeNavItem(item, user.role));
            if (items.length === 0) return null;
            return (
              <div key={group.id} className="admin-nav-group">
                <p className="admin-nav-group-label">{group.label}</p>
                <ul>
                  {items.map((item) => {
                    const active =
                      item.href === "/admin"
                        ? pathname === "/admin"
                        : pathname === item.href || pathname.startsWith(`${item.href}/`);
                    if (item.comingSoon) {
                      return (
                        <li key={item.id}>
                          <span className="admin-nav-item is-soon" title="Bientôt disponible">
                            <span className="admin-nav-item-label">{item.label}</span>
                            <span className="admin-nav-soon">Bientôt</span>
                          </span>
                        </li>
                      );
                    }
                    return (
                      <li key={item.id}>
                        <Link
                          href={item.href}
                          className={active ? "admin-nav-item is-active" : "admin-nav-item"}
                          onClick={() => setOpen(false)}
                        >
                          <span className="admin-nav-item-label">{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-chip">
            <span className="admin-user-avatar" aria-hidden>
              {user.name.slice(0, 1).toUpperCase()}
            </span>
            <div>
              <p className="admin-user-name">{user.name}</p>
              <p className="admin-user-role">
                {user.role === "SUPER_ADMIN" ? "Super admin" : "Staff"}
              </p>
            </div>
          </div>
          <button type="button" className="admin-logout" onClick={() => void logout()}>
            Déconnexion
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-menu-btn"
            aria-label="Ouvrir le menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
          <div className="admin-topbar-title">
            <p className="admin-eyebrow">Back-office FMMT</p>
            <h1>{current?.label || "Administration"}</h1>
            {current?.description && <p className="admin-page-desc">{current.description}</p>}
          </div>
          <a className="admin-site-link" href="https://fmmt.events" target="_blank" rel="noreferrer">
            Voir le site
          </a>
        </header>

        <div className="admin-content">{children}</div>
      </div>

      <button
        type="button"
        className="admin-backdrop"
        aria-label="Fermer le menu"
        onClick={() => setOpen(false)}
      />
    </div>
  );
}
