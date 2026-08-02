// ============================================================
// prisma/seed.ts
// Seeds the database with predefined UrbanVerse city zones
// ============================================================

import "dotenv/config";
process.loadEnvFile(".env.local");

import { prisma } from "../lib/prisma";
import { ZONES } from "../config/zones";

async function main() {
  console.log("🌱 Seeding UrbanVerse zones...");

  for (const zone of ZONES) {
    await prisma.zone.upsert({
      where: { id: zone.id },
      update: {
        name: zone.name,
        description: zone.description,
        population: zone.population,
      },
      create: {
        id: zone.id,
        name: zone.name,
        description: zone.description,
        population: zone.population,
      },
    });
    console.log(`  ✅ Zone seeded: ${zone.name}`);
  }

  console.log("✨ Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
