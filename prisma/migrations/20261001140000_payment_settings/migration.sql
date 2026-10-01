CREATE TABLE "PaymentSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "institution" VARCHAR(120),
    "accountHolder" VARCHAR(120),
    "accountIdentifier" VARCHAR(140),
    "alias" VARCHAR(100),
    "taxId" VARCHAR(40),
    "instructions" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentSettings_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "PaymentSettings" ENABLE ROW LEVEL SECURITY;