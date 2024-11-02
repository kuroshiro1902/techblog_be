-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('SYNCED', 'NOT_SYNCED', 'NEED_SYNC');

-- CreateTable
CREATE TABLE "PostLog" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "status" "PostStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PostLog" ADD CONSTRAINT "PostLog_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
