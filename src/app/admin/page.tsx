import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminAppShell } from "@/components/admin/AdminAppShell";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default async function AdminDashboardPage() {
  const session = await requireAdminSession();
  if (!session) redirect("/admin/login");

  const [total, participant, artiste, officiel, media, recent] = await Promise.all([
    prisma.participant.count(),
    prisma.participant.count({ where: { typeInscription: "PARTICIPANT" } }),
    prisma.participant.count({ where: { typeInscription: "ARTISTE" } }),
    prisma.participant.count({ where: { typeInscription: "OFFICIEL" } }),
    prisma.participant.count({ where: { typeInscription: "MEDIA" } }),
    prisma.participant.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        prenom: true,
        nom: true,
        email: true,
        typeInscription: true,
        paysNom: true,
        createdAt: true,
      },
    }),
  ]);

  return (
    <AdminAppShell user={session}>
      <AdminDashboard
        role={session.role}
        stats={{ total, participant, artiste, officiel, media }}
        recent={recent.map((r) => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
        }))}
      />
    </AdminAppShell>
  );
}
