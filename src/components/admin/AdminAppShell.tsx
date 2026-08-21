"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { AdminSession } from "@/lib/auth";
import {
  adminNavGroups,
  canSeeNavItem,
  findNavItem,
} from "@/lib/admin-nav";
import { AdminAvatar } from "@/components/admin/AdminAvatar";
import { AdminProfileModal } from "@/components/admin/AdminProfileModal";
import { AdminTopbarControls } from "@/components/admin/AdminTopbarControls";

function NavIcon({ id }: { id: string }) {
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

  switch (id) {
    case "dashboard":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="9" rx="1.5" />
          <rect x="14" y="3" width="7" height="5" rx="1.5" />
          <rect x="14" y="12" width="7" height="9" rx="1.5" />
          <rect x="3" y="16" width="7" height="5" rx="1.5" />
        </svg>
      );
    case "participants":
      return (
        <svg {...common}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "artists":
      return (
        <svg {...common}>
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      );
    case "events":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      );
    case "tickets":
      return (
        <svg {...common}>
          <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z" />
          <path d="M9 7v10" />
        </svg>
      );
    case "sponsors":
      return (
        <svg {...common}>
          <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />
        </svg>
      );
    case "news":
      return (
        <svg {...common}>
          <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
          <path d="M18 14h-8M15 18h-5M10 6h8v4h-8z" />
        </svg>
      );
    case "media":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
}

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
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState(user);
  const current = findNavItem(pathname);

  useEffect(() => {
    setProfile(user);
  }, [user]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const primaryGroups = adminNavGroups.filter((g) => g.id !== "system");
  const systemGroup = adminNavGroups.find((g) => g.id === "system");

  return (
    <div className={`admin-app${open ? " is-nav-open" : ""}`}>
      <aside className="admin-sidebar" aria-label="Navigation admin">
        <div className="admin-sidebar-brand">
          <div className="admin-brand-row">
            <Image
              src="/img/logo-fr-01.png"
              alt="FMMT"
              width={112}
              height={36}
              className="admin-sidebar-logo"
              priority
            />
          </div>
          <div className="admin-workspace">
            <button
              type="button"
              className="admin-workspace-profile"
              onClick={() => setProfileOpen(true)}
              title="Modifier mon profil"
            >
              <AdminAvatar
                name={profile.name}
                userId={profile.id}
                photoUrl={profile.photoUrl}
                className="admin-workspace-avatar"
              />
              <div className="admin-workspace-meta">
                <p className="admin-workspace-name">{profile.name}</p>
                <p className="admin-workspace-role">
                  {profile.role === "SUPER_ADMIN" ? "Super admin" : "Staff"}
                </p>
              </div>
            </button>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          {primaryGroups.map((group) => {
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
                            <span className="admin-nav-item-main">
                              <NavIcon id={item.id} />
                              <span>{item.label}</span>
                            </span>
                            <span className="admin-nav-soon">Soon</span>
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
                          <span className="admin-nav-item-main">
                            <NavIcon id={item.id} />
                            <span>{item.label}</span>
                          </span>
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
          {systemGroup &&
            systemGroup.items
              .filter((item) => canSeeNavItem(item, user.role))
              .map((item) =>
                item.comingSoon ? (
                  <span key={item.id} className="admin-nav-item is-soon">
                    <span className="admin-nav-item-main">
                      <NavIcon id={item.id} />
                      <span>{item.label}</span>
                    </span>
                  </span>
                ) : (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={
                      pathname.startsWith(item.href)
                        ? "admin-nav-item is-active"
                        : "admin-nav-item"
                    }
                    onClick={() => setOpen(false)}
                  >
                    <span className="admin-nav-item-main">
                      <NavIcon id={item.id} />
                      <span>{item.label}</span>
                    </span>
                  </Link>
                ),
              )}
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
            <h1>{current?.label || "Administration"}</h1>
          </div>
          <div className="admin-topbar-actions">
            <a className="admin-site-link" href="https://fmmt.events" target="_blank" rel="noreferrer">
              Site public
            </a>
            <AdminTopbarControls userName={profile.name} />
            <button
              type="button"
              className="admin-top-user"
              title="Modifier mon profil"
              onClick={() => setProfileOpen(true)}
            >
              <AdminAvatar
                name={profile.name}
                userId={profile.id}
                photoUrl={profile.photoUrl}
                className="admin-top-avatar"
              />
              <div className="admin-top-user-meta">
                <p className="admin-top-user-name">{profile.name}</p>
                <p className="admin-top-user-role">
                  {profile.role === "SUPER_ADMIN" ? "Super admin" : "Staff"}
                </p>
              </div>
            </button>
          </div>
        </header>

        <div className="admin-content">{children}</div>
      </div>

      <button
        type="button"
        className="admin-backdrop"
        aria-label="Fermer le menu"
        onClick={() => setOpen(false)}
      />

      <AdminProfileModal
        user={profile}
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        onSaved={(next) => {
          setProfile(next);
          router.refresh();
        }}
      />
    </div>
  );
}
