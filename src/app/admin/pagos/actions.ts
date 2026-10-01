"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { paymentSettingsSchema } from "@/lib/validators/payment-settings";
import { redirect } from "next/navigation";

export async function savePaymentSettings(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/login");

  const parsed = paymentSettingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin/pagos?error=datos");

  await prisma.paymentSettings.upsert({
    where: { id: "default" },
    create: { id: "default", ...parsed.data },
    update: parsed.data
  });

  redirect("/admin/pagos?guardado=1");
}