import { sendTransactionalEmail, type DeliveryResult, type NotificationType } from "./notifications";

export type EmailEventType =
  | "user.registered"
  | "payment.requested"
  | "payment.approved"
  | "course.completed"
  | "class.reminder";

export type EmailEventResult = {
  ok: boolean;
  eventType: EmailEventType;
  recipient?: string;
  message?: string;
  delivery?: DeliveryResult;
};

function getString(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  return typeof value === "string" ? value.trim() : "";
}

function buildEmailForEvent(eventType: EmailEventType, payload: Record<string, unknown>) {
  const to = getString(payload, "email");
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return null;

  const notificationType: Record<EmailEventType, NotificationType> = {
    "user.registered": "welcome",
    "payment.requested": "payment-pending",
    "payment.approved": "payment-approved",
    "course.completed": "certificate-issued",
    "class.reminder": "class-reminder"
  };

  const firstName = getString(payload, "firstName") || getString(payload, "name") || "alumno";
  const variables: Record<string, string> = { firstName };

  if (eventType === "payment.requested" || eventType === "payment.approved" || eventType === "course.completed") {
    variables.courseTitle = getString(payload, "courseTitle") || "el curso";
  }
  if (eventType === "payment.approved") variables.amount = getString(payload, "amount");
  if (eventType === "course.completed") {
    variables.certificateCode = getString(payload, "certificateCode");
    variables.certificateUrl = getString(payload, "certificateUrl");
  }
  if (eventType === "class.reminder") {
    variables.classTitle = getString(payload, "classTitle") || "la clase";
    variables.scheduledAt = getString(payload, "scheduledAt");
    variables.meetingUrl = getString(payload, "meetingUrl");
  }

  return { type: notificationType[eventType], to, variables };
}

export async function dispatchEmailEvent(
  eventType: EmailEventType,
  payload: Record<string, unknown>
): Promise<EmailEventResult> {
  const email = buildEmailForEvent(eventType, payload);
  if (!email) {
    return { ok: false, eventType, message: "A valid recipient email is required for this event." };
  }

  const delivery = await sendTransactionalEmail(email);
  return {
    ok: delivery.ok,
    eventType,
    recipient: delivery.recipient,
    message: delivery.ok ? "Email delivered." : delivery.error,
    delivery
  };
}
