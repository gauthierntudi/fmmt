import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const participants = await prisma.participant.findMany({
    include: { voyage: true, hebergement: true },
    orderBy: { createdAt: "desc" },
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Participants");

  sheet.columns = [
    { header: "Date", key: "date", width: 20 },
    { header: "Prénom", key: "prenom", width: 18 },
    { header: "Nom", key: "nom", width: 18 },
    { header: "Email", key: "email", width: 28 },
    { header: "Téléphone", key: "telephone", width: 18 },
    { header: "Pays", key: "pays", width: 18 },
    { header: "Type", key: "type", width: 14 },
    { header: "Fonction", key: "fonction", width: 20 },
    { header: "Société", key: "societe", width: 20 },
    { header: "Lettre", key: "lettre", width: 10 },
    { header: "Locale", key: "locale", width: 8 },
    { header: "Accès", key: "acces", width: 12 },
    { header: "Arrivée", key: "arrivee", width: 18 },
    { header: "Départ", key: "depart", width: 18 },
    { header: "Compagnie", key: "compagnie", width: 16 },
    { header: "Vol", key: "vol", width: 12 },
    { header: "Hôtel", key: "hotel", width: 28 },
    { header: "Chambre", key: "room", width: 22 },
    { header: "Prix", key: "price", width: 12 },
    { header: "Distance", key: "distance", width: 12 },
  ];

  for (const p of participants) {
    sheet.addRow({
      date: p.createdAt.toISOString(),
      prenom: p.prenom,
      nom: p.nom,
      email: p.email,
      telephone: p.telephone,
      pays: p.paysNom,
      type: p.typeInscription,
      fonction: p.fonction,
      societe: p.societe || "",
      lettre: p.lettreInvitation,
      locale: p.locale,
      acces: p.voyage?.typeAcces || "",
      arrivee: p.voyage
        ? `${p.voyage.dateArrivee?.toISOString().slice(0, 10) || ""} ${p.voyage.heureArrivee || ""}`.trim()
        : "",
      depart: p.voyage
        ? `${p.voyage.dateDepart?.toISOString().slice(0, 10) || ""} ${p.voyage.heureDepart || ""}`.trim()
        : "",
      compagnie: p.voyage?.compagnieAerienne || "",
      vol: p.voyage?.numeroVol || "",
      hotel: p.hebergement?.hotel || "",
      room: p.hebergement?.roomType || "",
      price: p.hebergement?.price || "",
      distance: p.hebergement?.distance || "",
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="participants-fmmt.xlsx"`,
    },
  });
}
