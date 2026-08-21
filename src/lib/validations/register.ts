import { z } from "zod";
import { getCountryByCode, isRDC } from "@/lib/countries";
import { getHotel, getRoomPrice } from "@/lib/hotels";

export const typeInscriptionSchema = z.enum([
  "PARTICIPANT",
  "ARTISTE",
  "OFFICIEL",
  "MEDIA",
]);

export const lettreInvitationSchema = z.enum(["OUI", "NON"]);

export const typeAccesSchema = z.enum(["AEROPORT", "BEACH"]);

const baseSchema = z.object({
  email: z.string().email(),
  nom: z.string().min(1).max(120),
  prenom: z.string().min(1).max(120),
  typeInscription: typeInscriptionSchema,
  paysCode: z.string().length(2),
  telephone: z.string().min(6).max(30),
  fonction: z.string().min(1).max(200),
  societe: z.string().max(200).optional().nullable(),
  lettreInvitation: lettreInvitationSchema,
  locale: z.enum(["fr", "en"]),
  typeAcces: typeAccesSchema.optional().nullable(),
  dateArrivee: z.string().optional().nullable(),
  heureArrivee: z.string().optional().nullable(),
  dateDepart: z.string().optional().nullable(),
  heureDepart: z.string().optional().nullable(),
  compagnieAerienne: z.string().max(120).optional().nullable(),
  numeroVol: z.string().max(60).optional().nullable(),
  hotel: z.string().optional().nullable(),
  roomType: z.string().optional().nullable(),
});

export type RegisterInput = z.infer<typeof baseSchema>;

export type RegisterParsed = RegisterInput & {
  paysNom: string;
  isRDC: boolean;
  roomPrice: string | null;
  hotelDistance: string | null;
};

function parseDate(value: string): Date | null {
  // Accept dd-mm-yyyy or yyyy-mm-dd
  const dmy = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value);
  if (dmy) {
    const [, dd, mm, yyyy] = dmy;
    return new Date(`${yyyy}-${mm}-${dd}T00:00:00.000Z`);
  }
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (iso) {
    return new Date(`${value}T00:00:00.000Z`);
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function validateRegistration(raw: unknown): {
  success: true;
  data: RegisterParsed;
} | {
  success: false;
  error: string;
  issues?: z.ZodIssue[];
} {
  const parsed = baseSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: "INVALID_PAYLOAD",
      issues: parsed.error.issues,
    };
  }

  const data = parsed.data;
  const country = getCountryByCode(data.paysCode);
  if (!country) {
    return { success: false, error: "UNKNOWN_COUNTRY" };
  }

  const rdc = isRDC(data.paysCode);

  if (!rdc) {
    if (
      !data.typeAcces ||
      !data.dateArrivee ||
      !data.heureArrivee ||
      !data.dateDepart ||
      !data.heureDepart
    ) {
      return { success: false, error: "TRAVEL_REQUIRED" };
    }
    if (!data.hotel || !data.roomType) {
      return { success: false, error: "HOTEL_REQUIRED" };
    }
  }

  let roomPrice: string | null = null;
  let hotelDistance: string | null = null;

  if (data.hotel) {
    const hotel = getHotel(data.hotel);
    if (!hotel) {
      return { success: false, error: "UNKNOWN_HOTEL" };
    }
    hotelDistance = hotel.distance;
    if (data.roomType) {
      roomPrice = getRoomPrice(data.hotel, data.roomType);
      if (roomPrice === null) {
        return { success: false, error: "UNKNOWN_ROOM" };
      }
    }
  }

  return {
    success: true,
    data: {
      ...data,
      societe: data.societe || null,
      paysNom: country.name,
      isRDC: rdc,
      roomPrice,
      hotelDistance,
    },
  };
}

export { parseDate };
