import type { AdminRole } from "@prisma/client";

export type AdminNavItem = {
  id: string;
  href: string;
  label: string;
  description?: string;
  roles?: AdminRole[];
  comingSoon?: boolean;
};

export type AdminNavGroup = {
  id: string;
  label: string;
  items: AdminNavItem[];
};

/** Single source of truth — add modules here as the festival ops grow. */
export const adminNavGroups: AdminNavGroup[] = [
  {
    id: 'overview',
    label: "Vue d'ensemble",
    items: [
      {
        id: "dashboard",
        href: "/admin",
        label: "Tableau de bord",
        description: "Indicateurs et raccourcis",
      },
    ],
  },
  {
    id: "operations",
    label: "Opérations",
    items: [
      {
        id: "participants",
        href: "/admin/participants",
        label: "Inscriptions",
        description: "Participants, artistes, médias, officiels",
      },
      {
        id: "artists",
        href: "/admin/artistes",
        label: "Artistes",
        description: "Line-up et fiches artistes",
        comingSoon: true,
      },
      {
        id: "events",
        href: "/admin/evenements",
        label: "Événements",
        description: "Programme et scènes",
        comingSoon: true,
      },
      {
        id: "tickets",
        href: "/admin/billets",
        label: "Billets",
        description: "Ventes et contrôle d'accès",
        comingSoon: true,
      },
      {
        id: "sponsors",
        href: "/admin/sponsors",
        label: "Sponsors",
        description: "Partenaires et activations",
        comingSoon: true,
      },
    ],
  },
  {
    id: "content",
    label: "Contenu",
    items: [
      {
        id: "news",
        href: "/admin/actualites",
        label: "Actualités",
        description: "Articles et annonces",
        comingSoon: true,
      },
      {
        id: "media",
        href: "/admin/medias",
        label: "Médias",
        description: "Photos, vidéos, dossiers presse",
        comingSoon: true,
      },
    ],
  },
  {
    id: "system",
    label: "Système",
    items: [
      {
        id: "users",
        href: "/admin/users",
        label: "Utilisateurs",
        description: "Comptes staff et super admin",
        roles: ["SUPER_ADMIN"],
      },
      {
        id: "settings",
        href: "/admin/parametres",
        label: "Paramètres",
        description: "Configuration générale",
        roles: ["SUPER_ADMIN"],
        comingSoon: true,
      },
    ],
  },
];

export function canSeeNavItem(item: AdminNavItem, role: AdminRole) {
  if (!item.roles || item.roles.length === 0) return true;
  return item.roles.includes(role);
}

export function findNavItem(pathname: string): AdminNavItem | undefined {
  const normalized = pathname.replace(/\/$/, "") || "/admin";
  for (const group of adminNavGroups) {
    for (const item of group.items) {
      if (item.href === normalized) return item;
      if (item.href !== "/admin" && normalized.startsWith(item.href)) return item;
    }
  }
  return undefined;
}
