import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildNotificationEmail, sendTransactionalEmail, type NotificationTemplate } from "./notifications";

const fetchMock = vi.hoisted(() => vi.fn());

describe("notifications", () => {
  beforeEach(() => {
    vi.stubEnv("EMAIL_PROVIDER", "console");
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("EMAIL_FROM", "");
    fetchMock.mockReset().mockResolvedValue(new Response(JSON.stringify({ id: "resend-message-123" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("builds a welcome email payload for a new student", () => {
    const email = buildNotificationEmail({
      type: "welcome",
      to: "ana@example.com",
      variables: { firstName: "Ana" }
    });

    expect(email.subject).toContain("Bienvenida");
    expect(email.html).toContain("Ana");
    expect(email.text).toContain("Ana");
  });

  it("escapes HTML variables while preserving readable plain text", () => {
    const email = buildNotificationEmail({
      type: "welcome",
      to: "ana@example.com",
      variables: { firstName: "<img src=x onerror=alert(1)>" }
    });

    expect(email.html).toContain("&lt;img src=x onerror=alert(1)&gt;");
    expect(email.html).not.toContain("<img src=x");
    expect(email.text).toContain("<img src=x onerror=alert(1)>");
  });

  it("sends through the configured provider and returns a delivery summary", async () => {
    const result = await sendTransactionalEmail({
      type: "payment-approved",
      to: "ana@example.com",
      variables: { firstName: "Ana", courseTitle: "Curso de React" }
    });

    expect(result.ok).toBe(true);
    expect(result.provider).toBe("console");
    expect(result.recipient).toBe("ana@example.com");
  });

  it("sends through Resend when the email provider is configured", async () => {
    vi.stubEnv("EMAIL_PROVIDER", "resend");
    vi.stubEnv("RESEND_API_KEY", "resend-secret");
    vi.stubEnv("EMAIL_FROM", "Campus <campus@example.com>");

    const result = await sendTransactionalEmail({
      type: "welcome",
      to: "ana@example.com",
      variables: { firstName: "Ana" }
    });

    expect(result).toMatchObject({
      ok: true,
      provider: "resend",
      recipient: "ana@example.com",
      messageId: "resend-message-123"
    });
    expect(fetchMock).toHaveBeenCalledWith("https://api.resend.com/emails", expect.objectContaining({
      method: "POST",
      headers: expect.objectContaining({ Authorization: "Bearer resend-secret" })
    }));
  });

  it("reports incomplete email settings instead of pretending the email was sent", async () => {
    vi.stubEnv("EMAIL_PROVIDER", "resend");
    vi.stubEnv("RESEND_API_KEY", "");

    const result = await sendTransactionalEmail({ type: "welcome", to: "ana@example.com" });

    expect(result.ok).toBe(false);
    expect(result.error).toContain("RESEND_API_KEY");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("supports a custom notification template config", () => {
    const template: NotificationTemplate = {
      subject: "Recordatorio",
      text: "Hola {{firstName}}, te recordamos la clase.",
      html: "<p>Hola {{firstName}}, te recordamos la clase.</p>"
    };

    const rendered = buildNotificationEmail({
      type: "custom",
      to: "ana@example.com",
      template,
      variables: { firstName: "Ana" }
    });

    expect(rendered.subject).toBe("Recordatorio");
    expect(rendered.text).toContain("Ana");
  });
});
