/*
  Warnings:

  - Added the required column `slug` to the `PostRevision` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PostRevision" ADD COLUMN     "slug" VARCHAR(255) NOT NULL;
