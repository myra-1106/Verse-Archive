ALTER TABLE "Work"
ADD COLUMN "usageRequirements" TEXT NOT NULL DEFAULT '',
ADD COLUMN "acquisitionMethod" TEXT NOT NULL DEFAULT '',
ADD COLUMN "contactDetails" TEXT NOT NULL DEFAULT '',
ADD COLUMN "otherNotes" TEXT NOT NULL DEFAULT '',
ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "Environment" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Environment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Environment_name_key" ON "Environment"("name");

CREATE TABLE "WorkEnvironment" (
  "workId" TEXT NOT NULL,
  "environmentId" TEXT NOT NULL,
  CONSTRAINT "WorkEnvironment_pkey" PRIMARY KEY ("workId", "environmentId")
);

CREATE TABLE "AuthorTemplate" (
  "id" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "directPriceCents" INTEGER NOT NULL,
  "repostPriceCents" INTEGER NOT NULL,
  "features" TEXT NOT NULL,
  "usageRequirements" TEXT NOT NULL DEFAULT '',
  "acquisitionMethod" TEXT NOT NULL DEFAULT '',
  "repostRequirements" TEXT NOT NULL,
  "purchaseNotes" TEXT NOT NULL,
  "contactDetails" TEXT NOT NULL DEFAULT '',
  "otherNotes" TEXT NOT NULL DEFAULT '',
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AuthorTemplate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AuthorTemplate_authorId_name_key" ON "AuthorTemplate"("authorId", "name");
CREATE INDEX "AuthorTemplate_authorId_displayOrder_idx" ON "AuthorTemplate"("authorId", "displayOrder");

CREATE TABLE "TemplateEnvironment" (
  "templateId" TEXT NOT NULL,
  "environmentId" TEXT NOT NULL,
  CONSTRAINT "TemplateEnvironment_pkey" PRIMARY KEY ("templateId", "environmentId")
);

ALTER TABLE "WorkEnvironment" ADD CONSTRAINT "WorkEnvironment_workId_fkey"
FOREIGN KEY ("workId") REFERENCES "Work"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkEnvironment" ADD CONSTRAINT "WorkEnvironment_environmentId_fkey"
FOREIGN KEY ("environmentId") REFERENCES "Environment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuthorTemplate" ADD CONSTRAINT "AuthorTemplate_authorId_fkey"
FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TemplateEnvironment" ADD CONSTRAINT "TemplateEnvironment_templateId_fkey"
FOREIGN KEY ("templateId") REFERENCES "AuthorTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TemplateEnvironment" ADD CONSTRAINT "TemplateEnvironment_environmentId_fkey"
FOREIGN KEY ("environmentId") REFERENCES "Environment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "Environment" ("id", "name", "enabled", "displayOrder", "updatedAt")
VALUES
  ('00000000-0000-4000-8000-000000000001', 'LAB', true, 0, CURRENT_TIMESTAMP),
  ('00000000-0000-4000-8000-000000000002', 'WCGlass', true, 1, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "WorkEnvironment" ("workId", "environmentId")
SELECT "id", '00000000-0000-4000-8000-000000000001' FROM "Work" WHERE "supportsLab" = true
ON CONFLICT DO NOTHING;

INSERT INTO "WorkEnvironment" ("workId", "environmentId")
SELECT "id", '00000000-0000-4000-8000-000000000002' FROM "Work" WHERE "supportsWcglass" = true
ON CONFLICT DO NOTHING;

INSERT INTO "AuthorCategory" ("id", "authorId", "name", "displayOrder", "createdAt", "updatedAt")
SELECT md5(w."authorId" || ':other'), w."authorId", '其他作品',
       COALESCE((SELECT MAX(c."displayOrder") + 1 FROM "AuthorCategory" c WHERE c."authorId" = w."authorId"), 0),
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Work" w
WHERE w."authorCategoryId" IS NULL
GROUP BY w."authorId"
ON CONFLICT ("authorId", "name") DO NOTHING;

UPDATE "Work" w
SET "authorCategoryId" = c."id"
FROM "AuthorCategory" c
WHERE w."authorCategoryId" IS NULL
  AND c."authorId" = w."authorId"
  AND c."name" = '其他作品';
