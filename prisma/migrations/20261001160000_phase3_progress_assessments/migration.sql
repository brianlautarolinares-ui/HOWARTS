ALTER TABLE "LiveClass" ADD COLUMN "recordingUrl" VARCHAR(500);

CREATE TABLE "ClassProgress" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "liveClassId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassProgress_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ClassQuiz" (
    "id" TEXT NOT NULL,
    "liveClassId" TEXT NOT NULL,
    "passingPercent" INTEGER NOT NULL DEFAULT 70,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassQuiz_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QuizQuestion" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "prompt" VARCHAR(1000) NOT NULL,
    "choices" JSONB NOT NULL,
    "correctAnswer" VARCHAR(300) NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "QuizQuestion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QuizAttempt" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "scorePercent" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ClassProgress_enrollmentId_liveClassId_key" ON "ClassProgress"("enrollmentId", "liveClassId");
CREATE INDEX "ClassProgress_liveClassId_idx" ON "ClassProgress"("liveClassId");
CREATE UNIQUE INDEX "ClassQuiz_liveClassId_key" ON "ClassQuiz"("liveClassId");
CREATE UNIQUE INDEX "QuizQuestion_quizId_position_key" ON "QuizQuestion"("quizId", "position");
CREATE INDEX "QuizQuestion_quizId_idx" ON "QuizQuestion"("quizId");
CREATE INDEX "QuizAttempt_enrollmentId_quizId_attemptedAt_idx" ON "QuizAttempt"("enrollmentId", "quizId", "attemptedAt");
CREATE INDEX "QuizAttempt_quizId_passed_idx" ON "QuizAttempt"("quizId", "passed");

ALTER TABLE "ClassProgress" ADD CONSTRAINT "ClassProgress_enrollmentId_fkey"
    FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClassProgress" ADD CONSTRAINT "ClassProgress_liveClassId_fkey"
    FOREIGN KEY ("liveClassId") REFERENCES "LiveClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClassQuiz" ADD CONSTRAINT "ClassQuiz_liveClassId_fkey"
    FOREIGN KEY ("liveClassId") REFERENCES "LiveClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_quizId_fkey"
    FOREIGN KEY ("quizId") REFERENCES "ClassQuiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_quizId_fkey"
    FOREIGN KEY ("quizId") REFERENCES "ClassQuiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_enrollmentId_fkey"
    FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ClassProgress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ClassQuiz" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "QuizQuestion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "QuizAttempt" ENABLE ROW LEVEL SECURITY;