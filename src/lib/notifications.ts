export type NotificationType =
  | "welcome"
  | "payment-approved"
  | "payment-pending"
  | "class-reminder"
  | "certificate-issued"
  | "custom";

export type NotificationTemplate = {
  subject: string;
  text: string;
  html: string;
};

export type BuildNotificationInput = {
  type: NotificationType;
  to: string;
  variables?: Record<string, string>;
  template?: NotificationTemplate;
};

const defaultTemplates: Record<NotificationType, NotificationTemplate> = {
  welcome: {
    subject: "Bienvenida al Campus Educativo",
    text: "Hola {{firstName}}, ¡bienvenida! Ya podés empezar a explorar tus cursos.",
    html: "<p>Hola {{firstName}}, ¡bienvenida! Ya podés empezar a explorar tus cursos.</p>"
  },
  "payment-approved": {
    subject: "Pago confirmado: {{courseTitle}}",
    text: "Hola {{firstName}}, tu pago para {{courseTitle}} fue confirmado. Importe: {{amount}}.",
    html: "<p>Hola {{firstName}}, tu pago para {{courseTitle}} fue confirmado.</p><p>Importe: {{amount}}</p>"
  },
  "payment-pending": {
    subject: "Pago pendiente: {{courseTitle}}",
    text: "Hola {{firstName}}, todavía no confirmamos tu pago para {{courseTitle}}.",
    html: "<p>Hola {{firstName}}, todavía no confirmamos tu pago para {{courseTitle}}.</p>"
  },
  "class-reminder": {
    subject: "Recordatorio de clase: {{classTitle}}",
    text: "Hola {{firstName}}, te recordamos la clase {{classTitle}}. {{scheduledAt}} {{meetingUrl}}",
    html: "<p>Hola {{firstName}}, te recordamos la clase {{classTitle}}.</p><p>{{scheduledAt}}</p><p>{{meetingUrl}}</p>"
  },
  "certificate-issued": {
    subject: "Tu certificado de {{courseTitle}} está disponible",
    text: "Hola {{firstName}}, emitimos tu certificado para {{courseTitle}}. Código: {{certificateCode}}. Verificación: {{certificateUrl}}",
    html: "<p>Hola {{firstName}}, emitimos tu certificado para {{courseTitle}}.</p><p>Código: {{certificateCode}}</p><p>Verificación: {{certificateUrl}}</p>"
  },
  custom: {
    subject: "Mensaje del Campus Educativo",
    text: "Hola {{firstName}}, tenés un nuevo mensaje.",
    html: "<p>Hola {{firstName}}, tenés un nuevo mensaje.</p>"
  }
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderTemplate(template: string, variables: Record<string, string>, html = false) {
  return Object.entries(variables).reduce((result, [key, value]) => {
    const safeValue = html ? escapeHtml(value) : value;
    const token = new RegExp(`{{\\s*${key.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\s*}}`, "g");
    return result.replace(token, () => safeValue);
  }, template);
}

export function buildNotificationEmail({
  type,
  to,
  variables = {},
  template
}: BuildNotificationInput) {
  const selectedTemplate = template ?? defaultTemplates[type];
  const normalizedVariables = {
    firstName: "alumno",
    ...variables,
    to
  };

  return {
    to,
    subject: renderTemplate(selectedTemplate.subject, normalizedVariables),
    text: renderTemplate(selectedTemplate.text, normalizedVariables),
    html: renderTemplate(selectedTemplate.html, normalizedVariables, true)
  };
}

export type DeliveryResult = {
  ok: boolean;
  recipient: string;
  provider: "console" | "resend";
  messageId?: string;
  error?: string;
};

export async function sendTransactionalEmail({
  type,
  to,
  variables,
  template
}: BuildNotificationInput): Promise<DeliveryResult> {
  const email = buildNotificationEmail({ type, to, variables, template });
  const provider = process.env.EMAIL_PROVIDER ?? "console";

  if (provider === "console") {
    console.info("[email:console]", JSON.stringify({ to: email.to, subject: email.subject }));
    return {
      ok: true,
      recipient: email.to,
      provider: "console",
      messageId: `console-${Date.now()}`
    };
  }

  if (provider !== "resend") {
    return { ok: false, recipient: email.to, provider: "resend", error: "EMAIL_PROVIDER must be console or resend." };
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();

  if (!apiKey || !from) {
    return {
      ok: false,
      recipient: email.to,
      provider: "resend",
      error: "Email configuration is incomplete. Set RESEND_API_KEY and EMAIL_FROM."
    };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: [email.to],
        subject: email.subject,
        text: email.text,
        html: email.html
      }),
      signal: AbortSignal.timeout(10000)
    });
    const responseBody = await response.json().catch(() => ({})) as { id?: unknown; message?: unknown };

    if (!response.ok) {
      return {
        ok: false,
        recipient: email.to,
        provider: "resend",
        error: typeof responseBody.message === "string" ? responseBody.message : `Email provider returned ${response.status}.`
      };
    }

    return {
      ok: true,
      recipient: email.to,
      provider: "resend",
      messageId: typeof responseBody.id === "string" ? responseBody.id : undefined
    };
  } catch (error) {
    console.error("email_delivery_error", error);
    return {
      ok: false,
      recipient: email.to,
      provider: "resend",
      error: error instanceof Error ? error.message : "Email delivery failed."
    };
  }
}
