/*
  Warnings:

  - You are about to drop the column `description` on the `PostRevision` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnailUrl` on the `PostRevision` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PostRevision" DROP COLUMN "description",
DROP COLUMN "thumbnailUrl";
