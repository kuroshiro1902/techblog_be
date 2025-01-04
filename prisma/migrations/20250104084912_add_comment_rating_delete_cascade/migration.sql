-- DropForeignKey
ALTER TABLE "CommentRating" DROP CONSTRAINT "CommentRating_commentId_fkey";

-- AddForeignKey
ALTER TABLE "CommentRating" ADD CONSTRAINT "CommentRating_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
