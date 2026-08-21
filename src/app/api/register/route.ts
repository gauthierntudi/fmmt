import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendConfirmationEmails } from "@/lib/mail";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { parseDate, validateRegistration } from "@/lib/validations/register";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const remoteIp =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      null;

    const turnstileOk = await verifyTurnstileToken(
      typeof body?.turnstileToken === "string" ? body.turnstileToken : null,
      remoteIp,
    );
    if (!turnstileOk) {
      return NextResponse.json(
        { message: "TURNSTILE_FAILED", error: "TURNSTILE_FAILED" },
        { status: 400 },
      );
    }

    const validated = validateRegistration(body);

    if (!validated.success) {
      return NextResponse.json(
        { message: validated.error, error: validated.error, issues: validated.issues },
        { status: 400 },
      );
    }

    const data = validated.data;

    const email = data.email.toLowerCase();
    const telephone = data.telephone.trim();

    const existingEmail = await prisma.participant.findUnique({
      where: { email },
    });
    if (existingEmail) {
      return NextResponse.json(
        { message: "DUPLICATE_EMAIL", error: "DUPLICATE_EMAIL" },
        { status: 409 },
      );
    }

    const existingPhone = await prisma.participant.findUnique({
      where: { telephone },
    });
    if (existingPhone) {
      return NextResponse.json(
        { message: "DUPLICATE_PHONE", error: "DUPLICATE_PHONE" },
        { status: 409 },
      );
    }

    const participant = await prisma.$transaction(async (tx) => {
      const created = await tx.participant.create({
        data: {
          email,
          nom: data.nom.trim(),
          prenom: data.prenom.trim(),
          typeInscription: data.typeInscription,
          paysCode: data.paysCode,
          paysNom: data.paysNom,
          telephone,
          fonction: data.fonction.trim(),
          societe: data.societe?.trim() || null,
          lettreInvitation: data.lettreInvitation,
          locale: data.locale,
        },
      });

      if (data.typeAcces) {
        await tx.voyage.create({
          data: {
            participantId: created.id,
            typeAcces: data.typeAcces,
            dateArrivee: data.dateArrivee ? parseDate(data.dateArrivee) : null,
            heureArrivee: data.heureArrivee || null,
            dateDepart: data.dateDepart ? parseDate(data.dateDepart) : null,
            heureDepart: data.heureDepart || null,
            compagnieAerienne: data.compagnieAerienne || null,
            numeroVol: data.numeroVol || null,
          },
        });
      }

      if (data.hotel) {
        await tx.hebergement.create({
          data: {
            participantId: created.id,
            hotel: data.hotel,
            roomType: data.roomType || null,
            price: data.roomPrice,
            distance: data.hotelDistance,
          },
        });
      }

      return created;
    });

    const emailSent = await sendConfirmationEmails({
      email: participant.email,
      nom: participant.nom,
      prenom: participant.prenom,
      typeInscription: participant.typeInscription,
      paysNom: participant.paysNom,
      fonction: participant.fonction,
      locale: participant.locale,
    });

    return NextResponse.json(
      {
        message: "OK",
        participantId: participant.id,
        emailSent,
        isRDC: data.isRDC,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const target = error.meta?.target;
      const fields = Array.isArray(target) ? target.map(String) : [String(target ?? "")];
      const code = fields.some((f) => f.includes("telephone"))
        ? "DUPLICATE_PHONE"
        : "DUPLICATE_EMAIL";
      return NextResponse.json({ message: code, error: code }, { status: 409 });
    }
    console.error("[register]", error);
    return NextResponse.json(
      { message: "SERVER_ERROR", error: "SERVER_ERROR" },
      { status: 500 },
    );
  }
}
