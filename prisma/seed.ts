import { PrismaClient, CourseStatus, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const initialPassword = process.env.ADMIN_INITIAL_PASSWORD;

  if (!adminEmail || !initialPassword) {
    throw new Error("Faltan ADMIN_EMAIL o ADMIN_INITIAL_PASSWORD en el entorno.");
  }

  const passwordHash = await bcrypt.hash(initialPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail.toLowerCase() },
    update: { role: Role.ADMIN, passwordHash },
    create: {
      name: "Profesora",
      email: adminEmail.toLowerCase(),
      passwordHash,
      role: Role.ADMIN
    }
  });

  await prisma.course.upsert({
    where: { slug: "curso-demo" },
    update: {},
    create: {
      title: "Curso de demostración",
      slug: "curso-demo",
      summary: "Curso publicado para validar catálogo y detalle.",
      description: "Contenido inicial de demostración para la Fase 1 del campus.",
      priceArs: 25000,
      status: CourseStatus.PUBLISHED,
      creatorId: admin.id
    }
  });
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
