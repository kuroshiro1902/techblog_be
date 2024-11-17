/*
  Warnings:

  - You are about to drop the column `point` on the `Rating` table. All the data in the column will be lost.
  - Added the required column `score` to the `Rating` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Rating" DROP COLUMN "point",
ADD COLUMN     "score" INTEGER NOT NULL;
