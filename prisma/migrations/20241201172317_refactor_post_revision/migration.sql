/*
  Warnings:

  - You are about to drop the column `version` on the `PostRevision` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "PostRevision_postId_version_key";

-- AlterTable
ALTER TABLE "PostRevision" DROP COLUMN "version",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false;
