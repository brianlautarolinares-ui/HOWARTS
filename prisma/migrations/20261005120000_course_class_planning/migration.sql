ALTER TABLE "LiveClass" ALTER COLUMN "scheduledAt" DROP NOT NULL;
ALTER TABLE "LiveClass" ADD COLUMN "position" INTEGER NOT NULL DEFAULT 1;

WITH ordered_classes AS (
    SELECT
        "id",
        ROW_NUMBER() OVER (
            PARTITION BY "stageId"
            ORDER BY "scheduledAt" NULLS LAST, "createdAt", "id"
        )::INTEGER AS "position"
    FROM "LiveClass"
)
UPDATE "LiveClass" AS live_class
SET "position" = ordered_classes."position"
FROM ordered_classes
WHERE live_class."id" = ordered_classes."id";

CREATE UNIQUE INDEX "LiveClass_stageId_position_key" ON "LiveClass"("stageId", "position");