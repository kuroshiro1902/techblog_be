import { DB } from "@/database/database";
import { z } from "zod";
import { postSchema, EPostField, POST_PUBLIC_FIELDS } from "@/post/validators/post.schema";

const restoreRevisionSchema = z.object({
  revisionId: z.number().positive()
});

export const restoreRevision = async (revisionId: number, authorId: number) => {
  const { revisionId: validatedRevisionId } = restoreRevisionSchema.parse({ revisionId });

  // Lấy thông tin revision cần restore
  const targetRevision = await DB.postRevision.findFirstOrThrow({
    where: {
      id: validatedRevisionId,
      post: {
        authorId // Đảm bảo chỉ author mới có thể restore
      }
    },
    select: {
      title: true,
      content: true,
      slug: true,
       postId: true
    }
  });

  // Batch transaction để restore revision
  return await DB.$transaction([
    // Query 1: Update post với nội dung từ revision
    DB.post.update({
      where: {
        id: targetRevision.postId,
        authorId
      },
      data: {
        title: targetRevision.title,
        content: targetRevision.content,
        slug: targetRevision.slug
      },
      select: POST_PUBLIC_FIELDS.reduce((prev, curr) => {
        return { ...prev, [curr]: true };
      }, {} as Record<EPostField, boolean>)
    }),
    // Query 2: Đánh dấu tất cả revision khác là không active
    DB.postRevision.updateMany({
      where: {
        postId: targetRevision.postId
      },
      data: { isActive: false }
    }),
    // Query 3: Tạo revision mới
    DB.postRevision.create({
      data: {
        isActive: true, title: targetRevision.title,
        content: targetRevision.content,
        slug: targetRevision.slug, postId: targetRevision.postId
      }
    }),
    // Query 4: Update postLog
    DB.postLog.updateMany({
      where: { postId: targetRevision.postId },
      data: { status: "NEED_SYNC" }
    })
  ]).then(([updatedPost]) => updatedPost);
}; 