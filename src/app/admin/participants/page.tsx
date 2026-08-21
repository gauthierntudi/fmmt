import { redirect } from "next/navigation";
import { isAdminAuthenticated, clearAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ParticipantsTable } from "@/components/admin/ParticipantsTable";

async function logout() {
  "use server";
  await clearAdminSession();
  redirect("/admin/login");
}

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function ParticipantsPage({ searchParams }: Props) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const { q } = await searchParams;
  const query = q?.trim() || "";

  const participants = await prisma.participant.findMany({
    where: query
      ? {
          OR: [
            { email: { contains: query, mode: "insensitive" } },
            { nom: { contains: query, mode: "insensitive" } },
            { prenom: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: { voyage: true, hebergement: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const serialized = participants.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    voyage: p.voyage
      ? {
          ...p.voyage,
          dateArrivee: p.voyage.dateArrivee?.toISOString() ?? null,
          dateDepart: p.voyage.dateDepart?.toISOString() ?? null,
        }
      : null,
  }));

  return (
    <div className="admin-shell">
      <header className="brand-bar">
        <div>
          <div className="brand-mark">FMMT Admin</div>
          <p className="brand-sub">Participants inscrits</p>
        </div>
        <form action={logout}>
          <button type="submit" className="btn btn-secondary trapezoid" style={{ fontSize: "1em" }}>
            Déconnexion
          </button>
        </form>
      </header>
      <ParticipantsTable initial={serialized} initialQuery={query} />
    </div>
  );
}
