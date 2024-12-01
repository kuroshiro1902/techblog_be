-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('REACTION', 'COMMENT', 'REPLY', 'SYSTEM');

-- CreateEnum
CREATE TYPE "NotificationItemType" AS ENUM ('post', 'comment');

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_parentCommentId_fkey";

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "type" "NotificationType" NOT NULL,
    "itemType" "NotificationItemType",
    "itemId" INTEGER,
    "messageTitle" TEXT,
    "messageContent" TEXT,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Notification_itemType_itemId_key" ON "Notification"("itemType", "itemId");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
