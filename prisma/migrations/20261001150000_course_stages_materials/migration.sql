CREATE TABLE "CourseStage" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseStage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LiveClass" (
    "id" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "meetingUrl" VARCHAR(500),
    "developedTopic" TEXT,
    "authorCredit" VARCHAR(120),
    "pdfName" VARCHAR(255),
    "pdfData" BYTEA,
    "releasedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiveClass_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CourseStage_courseId_position_key" ON "CourseStage"("courseId", "position");
CREATE INDEX "CourseStage_courseId_idx" ON "CourseStage"("courseId");
CREATE INDEX "LiveClass_stageId_scheduledAt_idx" ON "LiveClass"("stageId", "scheduledAt");

ALTER TABLE "CourseStage" ADD CONSTRAINT "CourseStage_courseId_fkey"
    FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LiveClass" ADD CONSTRAINT "LiveClass_stageId_fkey"
    FOREIGN KEY ("stageId") REFERENCES "CourseStage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CourseStage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LiveClass" ENABLE ROW LEVEL SECURITY;