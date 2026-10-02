export type AdminMetricInput = {
  role?: string;
  status?: string;
  amountArs?: number;
};

export type AdminMetrics = {
  totalStudents: number;
  publishedCourses: number;
  activeEnrollments: number;
  pendingRequests: number;
  approvedRevenue: number;
};

export function summarizeAdminMetrics({
  users,
  courses,
  enrollments,
  payments
}: {
  users: AdminMetricInput[];
  courses: AdminMetricInput[];
  enrollments: AdminMetricInput[];
  payments: AdminMetricInput[];
}): AdminMetrics {
  const totalStudents = users.filter((user) => user.role === "STUDENT").length;
  const publishedCourses = courses.filter((course) => course.status === "PUBLISHED").length;
  const activeEnrollments = enrollments.filter((enrollment) => enrollment.status === "ACTIVE" || enrollment.status === "COMPLETED").length;
  const pendingRequests = enrollments.filter((enrollment) => enrollment.status === "PENDING").length;
  const approvedRevenue = payments
    .filter((payment) => payment.status === "APPROVED")
    .reduce((total, payment) => total + (payment.amountArs ?? 0), 0);

  return {
    totalStudents,
    publishedCourses,
    activeEnrollments,
    pendingRequests,
    approvedRevenue
  };
}
