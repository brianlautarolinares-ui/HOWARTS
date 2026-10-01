export type CourseAccessRole = "ADMIN" | "STUDENT";
export type CourseEnrollmentStatus = "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED";

export function canAccessCourse(
  role: CourseAccessRole,
  enrollmentStatus: CourseEnrollmentStatus | null
): boolean {
  if (role === "ADMIN") return true;
  return enrollmentStatus === "ACTIVE" || enrollmentStatus === "COMPLETED";
}