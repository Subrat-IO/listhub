import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient, RoleName } from "@prisma/client";
import bcrypt from "bcryptjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const prisma = new PrismaClient();

async function ensureRole(name: RoleName) {
  await prisma.role.upsert({
    where: { name },
    create: { name },
    update: {},
  });
}

async function main() {
  for (const name of Object.values(RoleName)) {
    await ensureRole(name);
  }

  const electronics = await prisma.category.upsert({
    where: { slug: "electronics" },
    update: {},
    create: {
      name: "Electronics",
      slug: "electronics",
      description: "Phones, laptops, gadgets",
      sortOrder: 10,
    },
  });

  await prisma.categoryAttribute.upsert({
    where: {
      categoryId_key: { categoryId: electronics.id, key: "condition" },
    },
    update: {},
    create: {
      categoryId: electronics.id,
      key: "condition",
      label: "Condition",
      valueType: "string",
      required: true,
      sortOrder: 1,
    },
  });

  const vehicles = await prisma.category.upsert({
    where: { slug: "vehicles" },
    update: {},
    create: {
      name: "Vehicles",
      slug: "vehicles",
      description: "Cars, bikes, parts",
      sortOrder: 20,
    },
  });

  await prisma.categoryAttribute.upsert({
    where: {
      categoryId_key: { categoryId: vehicles.id, key: "year" },
    },
    update: {},
    create: {
      categoryId: vehicles.id,
      key: "year",
      label: "Year",
      valueType: "number",
      required: false,
      sortOrder: 1,
    },
  });

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@listhub.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123456!";

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    const adminRole = await prisma.role.findUniqueOrThrow({ where: { name: "SUPER_ADMIN" } });
    const userRole = await prisma.role.findUniqueOrThrow({ where: { name: "USER" } });

    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        profile: { create: { displayName: "ListHub Admin" } },
        userRoles: {
          createMany: {
            data: [{ roleId: adminRole.id }, { roleId: userRole.id }],
          },
        },
      },
    });

    // eslint-disable-next-line no-console
    console.log(`Seeded admin user: ${adminEmail}`);
  } else {
    // eslint-disable-next-line no-console
    console.log("Seed skipped: admin user already exists");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
