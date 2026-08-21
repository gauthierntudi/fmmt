import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminAppShell } from "@/components/admin/AdminAppShell";
import { ParticipantsTable } from "@/components/admin/ParticipantsTable";
import { Prisma, TypeInscription } from "@prisma/client";

type Props = {
  searchParams: Promise<{ q?: string; type?: string; page?: string }>;
};

export default async function ParticipantsPage({ searchParams }: Props) {
  const session = await requireAdminSession();
  if (!session) redirect("/admin/login");

  const params = await searchParams;
  const query = params.q?.trim() || "";
  const type = params.type?.trim() || "";
  const page = Math.max(1, Number(params.page || 1));
  const pageSize = 50;

  const where: Prisma.ParticipantWhereInput = {};
  if (query) {
    where.OR = [
      { email: { contains: query, mode: "insensitive" } },
      { nom: { contains: query, mode: "insensitive" } },
      { prenom: { contains: query, mode: "insensitive" } },
      { telephone: { contains: query, mode: "insensitive" } },
      { paysNom: { contains: query, mode: "insensitive" } },
    ];
  }
  if (type && Object.values(TypeInscription).includes(type as TypeInscription)) {
    where.typeInscription = type as TypeInscription;
  }

  const [total, participants] = await Promise.all([
    prisma.participant.count({ where }),
    prisma.participant.findMany({
      where,
      include: { voyage: true, hebergement: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

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
    <AdminAppShell user={session}>
      <ParticipantsTable
        initial={serialized}
        initialQuery={query}
        initialType={type}
        total={total}
        page={page}
        pageSize={pageSize}
        canDelete={session.role === "SUPER_ADMIN"}
      />
    </AdminAppShell>
  );
}
