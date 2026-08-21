import { PrismaClient, AdminRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";
  const name = process.env.ADMIN_NAME || "Super Admin";

  if (!email || !password) {
    console.warn("[seed] ADMIN_EMAIL / ADMIN_PASSWORD manquants — seed admin ignoré");
    return;
  }

  if (password === "change-me") {
    console.warn("[seed] ADMIN_PASSWORD encore à change-me — à renforcer en production");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.adminUser.upsert({
    where: { email },
    create: {
      email,
      name,
      passwordHash,
      role: AdminRole.SUPER_ADMIN,
      active: true,
    },
    update: {
      // Keep existing password unless you force reset via ADMIN_PASSWORD_RESET=true
      ...(process.env.ADMIN_PASSWORD_RESET === "true"
        ? { passwordHash, name, role: AdminRole.SUPER_ADMIN, active: true }
        : { name }),
    },
  });

  console.log(`[seed] Super admin prêt : ${email}`);
}

main()
  .catch((e) => {
    console.error("[seed]", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
