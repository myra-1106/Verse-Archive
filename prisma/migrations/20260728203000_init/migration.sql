-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'AUTHOR', 'CONTENT_ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "AuthorStatus" AS ENUM ('DRAFT', 'ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "WorkStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'OFF_SHELF', 'DELETED');

-- CreateEnum
CREATE TYPE "ApplicationType" AS ENUM ('NEW_AUTHOR', 'BIND_EXISTING', 'SWITCH_BINDING');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "wechatId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "sessionVersion" INTEGER NOT NULL DEFAULT 0,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "avatarAssetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Author" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bio" TEXT NOT NULL DEFAULT '',
    "publicWechatId" TEXT NOT NULL,
    "status" "AuthorStatus" NOT NULL DEFAULT 'DRAFT',
    "accountUserId" TEXT,
    "avatarAssetId" TEXT,
    "coverAssetId" TEXT,
    "wechatQrAssetId" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthorApplication" (
    "id" TEXT NOT NULL,
    "applicantUserId" TEXT NOT NULL,
    "targetAuthorId" TEXT,
    "type" "ApplicationType" NOT NULL,
    "proposedAuthorData" JSONB,
    "reason" TEXT NOT NULL DEFAULT '',
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewerUserId" TEXT,
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthorApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthorBindingHistory" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "previousUserId" TEXT,
    "nextUserId" TEXT,
    "actorUserId" TEXT NOT NULL,
    "applicationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthorBindingHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthorCategory" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthorCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Work" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "authorCategoryId" TEXT,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "supportsLab" BOOLEAN NOT NULL DEFAULT true,
    "supportsWcglass" BOOLEAN NOT NULL DEFAULT true,
    "directPriceCents" INTEGER NOT NULL,
    "repostPriceCents" INTEGER NOT NULL,
    "features" TEXT NOT NULL,
    "repostRequirements" TEXT NOT NULL,
    "purchaseNotes" TEXT NOT NULL,
    "status" "WorkStatus" NOT NULL DEFAULT 'DRAFT',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "mainAssetId" TEXT,
    "currentVersionId" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "favoriteCount" INTEGER NOT NULL DEFAULT 0,
    "contactClickCount" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Work_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkVersion" (
    "id" TEXT NOT NULL,
    "workId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "releasedAt" TIMESTAMP(3) NOT NULL,
    "changeLog" TEXT NOT NULL,
    "minLabVersion" TEXT,
    "minWcglassVersion" TEXT,
    "knownIssues" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkImage" (
    "id" TEXT NOT NULL,
    "workId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "userId" TEXT NOT NULL,
    "workId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("userId","workId")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "altText" TEXT NOT NULL DEFAULT '',
    "uploadedById" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportDraft" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "parsedData" JSONB NOT NULL,
    "createdById" TEXT NOT NULL,
    "publishedWorkId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "beforeData" JSONB,
    "afterData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_wechatId_key" ON "User"("wechatId");

-- CreateIndex
CREATE UNIQUE INDEX "Author_slug_key" ON "Author"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Author_accountUserId_key" ON "Author"("accountUserId");

-- CreateIndex
CREATE INDEX "AuthorCategory_authorId_displayOrder_idx" ON "AuthorCategory"("authorId", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "AuthorCategory_authorId_name_key" ON "AuthorCategory"("authorId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Work_slug_key" ON "Work"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Work_currentVersionId_key" ON "Work"("currentVersionId");

-- CreateIndex
CREATE INDEX "Work_authorId_authorCategoryId_displayOrder_idx" ON "Work"("authorId", "authorCategoryId", "displayOrder");

-- CreateIndex
CREATE INDEX "Work_status_publishedAt_idx" ON "Work"("status", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "WorkVersion_workId_version_key" ON "WorkVersion"("workId", "version");

-- CreateIndex
CREATE INDEX "WorkImage_workId_sortOrder_idx" ON "WorkImage"("workId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "WorkImage_workId_assetId_key" ON "WorkImage"("workId", "assetId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_workId_key" ON "Favorite"("userId", "workId");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_storageKey_key" ON "Asset"("storageKey");

-- CreateIndex
CREATE INDEX "AuditLog_resourceType_resourceId_createdAt_idx" ON "AuditLog"("resourceType", "resourceId", "createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_avatarAssetId_fkey" FOREIGN KEY ("avatarAssetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Author" ADD CONSTRAINT "Author_accountUserId_fkey" FOREIGN KEY ("accountUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Author" ADD CONSTRAINT "Author_avatarAssetId_fkey" FOREIGN KEY ("avatarAssetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Author" ADD CONSTRAINT "Author_coverAssetId_fkey" FOREIGN KEY ("coverAssetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Author" ADD CONSTRAINT "Author_wechatQrAssetId_fkey" FOREIGN KEY ("wechatQrAssetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthorApplication" ADD CONSTRAINT "AuthorApplication_applicantUserId_fkey" FOREIGN KEY ("applicantUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthorApplication" ADD CONSTRAINT "AuthorApplication_targetAuthorId_fkey" FOREIGN KEY ("targetAuthorId") REFERENCES "Author"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthorApplication" ADD CONSTRAINT "AuthorApplication_reviewerUserId_fkey" FOREIGN KEY ("reviewerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthorBindingHistory" ADD CONSTRAINT "AuthorBindingHistory_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthorBindingHistory" ADD CONSTRAINT "AuthorBindingHistory_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthorCategory" ADD CONSTRAINT "AuthorCategory_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Work" ADD CONSTRAINT "Work_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Work" ADD CONSTRAINT "Work_authorCategoryId_fkey" FOREIGN KEY ("authorCategoryId") REFERENCES "AuthorCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Work" ADD CONSTRAINT "Work_mainAssetId_fkey" FOREIGN KEY ("mainAssetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Work" ADD CONSTRAINT "Work_currentVersionId_fkey" FOREIGN KEY ("currentVersionId") REFERENCES "WorkVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Work" ADD CONSTRAINT "Work_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Work" ADD CONSTRAINT "Work_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkVersion" ADD CONSTRAINT "WorkVersion_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkVersion" ADD CONSTRAINT "WorkVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkImage" ADD CONSTRAINT "WorkImage_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkImage" ADD CONSTRAINT "WorkImage_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportDraft" ADD CONSTRAINT "ImportDraft_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportDraft" ADD CONSTRAINT "ImportDraft_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
