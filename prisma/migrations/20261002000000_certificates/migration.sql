CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verificationUrl" VARCHAR(500) NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Certificate_code_key"
    ON "Certificate"("code");

CREATE UNIQUE INDEX "Certificate_enrollmentId_key"
    ON "Certificate"("enrollmentId");

CREATE INDEX "Certificate_courseId_idx"
    ON "Certificate"("courseId");

CREATE INDEX "Certificate_userId_idx"
    ON "Certificate"("userId");

ALTER TABLE "Certificate"
    ADD CONSTRAINT "Certificate_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Certificate"
    ADD CONSTRAINT "Certificate_courseId_fkey"
    FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Certificate"
    ADD CONSTRAINT "Certificate_enrollmentId_fkey"
    FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
