-- CreateEnum
CREATE TYPE "TypeInscription" AS ENUM ('PARTICIPANT', 'ARTISTE', 'OFFICIEL', 'MEDIA');

-- CreateEnum
CREATE TYPE "LettreInvitation" AS ENUM ('OUI', 'NON');

-- CreateEnum
CREATE TYPE "TypeAcces" AS ENUM ('AEROPORT', 'BEACH');

-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "typeInscription" "TypeInscription" NOT NULL,
    "paysCode" TEXT NOT NULL,
    "paysNom" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "fonction" TEXT NOT NULL,
    "societe" TEXT,
    "lettreInvitation" "LettreInvitation" NOT NULL,
    "locale" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Voyage" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "typeAcces" "TypeAcces" NOT NULL,
    "dateArrivee" TIMESTAMP(3),
    "heureArrivee" TEXT,
    "dateDepart" TIMESTAMP(3),
    "heureDepart" TEXT,
    "compagnieAerienne" TEXT,
    "numeroVol" TEXT,

    CONSTRAINT "Voyage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hebergement" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "hotel" TEXT NOT NULL,
    "roomType" TEXT,
    "price" TEXT,
    "distance" TEXT,

    CONSTRAINT "Hebergement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Participant_email_key" ON "Participant"("email");

-- CreateIndex
CREATE INDEX "Participant_createdAt_idx" ON "Participant"("createdAt");

-- CreateIndex
CREATE INDEX "Participant_nom_prenom_idx" ON "Participant"("nom", "prenom");

-- CreateIndex
CREATE UNIQUE INDEX "Voyage_participantId_key" ON "Voyage"("participantId");

-- CreateIndex
CREATE UNIQUE INDEX "Hebergement_participantId_key" ON "Hebergement"("participantId");

-- AddForeignKey
ALTER TABLE "Voyage" ADD CONSTRAINT "Voyage_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hebergement" ADD CONSTRAINT "Hebergement_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
