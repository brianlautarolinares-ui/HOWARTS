import { describe, expect, it } from "vitest";
import { summarizeAdminMetrics } from "./admin-stats";

describe("summarizeAdminMetrics", () => {
  it("aggregates students, courses, enrollments and revenue from the current data", () => {
    const metrics = summarizeAdminMetrics({
      users: [
        { role: "STUDENT" },
        { role: "STUDENT" },
        { role: "ADMIN" },
        { role: "STUDENT" }
      ],
      courses: [
        { status: "PUBLISHED" },
        { status: "PUBLISHED" },
        { status: "DRAFT" }
      ],
      enrollments: [
        { status: "ACTIVE" },
        { status: "COMPLETED" },
        { status: "PENDING" },
        { status: "ACTIVE" }
      ],
      payments: [
        { status: "APPROVED", amountArs: 15000 },
        { status: "APPROVED", amountArs: 22000 },
        { status: "PENDING", amountArs: 5000 }
      ]
    });

    expect(metrics.totalStudents).toBe(3);
    expect(metrics.publishedCourses).toBe(2);
    expect(metrics.activeEnrollments).toBe(3);
    expect(metrics.pendingRequests).toBe(1);
    expect(metrics.approvedRevenue).toBe(37000);
  });
});
