import { beforeEach, describe, expect, it, vi } from "vitest";
import { dispatchEmailEvent } from "./notification-events";
import { sendTransactionalEmail } from "./notifications";

vi.mock("./notifications", () => ({
  sendTransactionalEmail: vi.fn().mockResolvedValue({
    ok: true,
    recipient: "ana@example.com",
    provider: "smtp",
    messageId: "mail-123"
  })
}));

describe("dispatchEmailEvent", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sends the welcome email with the registered user's actual address and name", async () => {
    const result = await dispatchEmailEvent("user.registered", {
      email: "ana@example.com",
      name: "Ana"
    });

    expect(result.ok).toBe(true);
    expect(sendTransactionalEmail).toHaveBeenCalledWith({
      type: "welcome",
      to: "ana@example.com",
      variables: { firstName: "Ana" }
    });
  });

  it("does not attempt delivery when the event has no valid recipient", async () => {
    const result = await dispatchEmailEvent("payment.approved", {
      userId: "user-123"
    });

    expect(result.ok).toBe(false);
    expect(result.message).toContain("recipient");
    expect(sendTransactionalEmail).not.toHaveBeenCalled();
  });

  it("dispatches the pending payment email with the selected course", async () => {
    await dispatchEmailEvent("payment.requested", {
      email: "ana@example.com",
      name: "Ana",
      courseTitle: "Curso de React"
    });

    expect(sendTransactionalEmail).toHaveBeenCalledWith({
      type: "payment-pending",
      to: "ana@example.com",
      variables: { firstName: "Ana", courseTitle: "Curso de React" }
    });
  });

  it("dispatches a class reminder with its schedule and meeting link", async () => {
    await dispatchEmailEvent("class.reminder", {
      email: "ana@example.com",
      name: "Ana",
      classTitle: "Introducción",
      scheduledAt: "2026-10-03T15:00:00.000Z",
      meetingUrl: "https://meet.example.com/class"
    });

    expect(sendTransactionalEmail).toHaveBeenCalledWith({
      type: "class-reminder",
      to: "ana@example.com",
      variables: {
        firstName: "Ana",
        classTitle: "Introducción",
        scheduledAt: "2026-10-03T15:00:00.000Z",
        meetingUrl: "https://meet.example.com/class"
      }
    });
  });
});
