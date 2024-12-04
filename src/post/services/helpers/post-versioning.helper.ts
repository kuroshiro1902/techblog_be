import { DB } from '@/database/database';
import { Prisma } from '@prisma/client';
import { createSlug } from './create-slug.helper';

// Helper function để lấy giá trị từ StringFieldUpdateOperationsInput hoặc string
const getFieldValue = (field: string | Prisma.StringFieldUpdateOperationsInput | undefined) => {
  if (!field) return undefined;
  if (typeof field === 'string') return field;
  return field.set;
};

type TUpdatePostWithRevision = {
  where: Prisma.PostWhereUniqueInput,
  data: Prisma.PostUpdateInput,
  select?: Prisma.PostSelect
}

export const updatePostWithRevision = async ({ where, data, select }: TUpdatePostWithRevision) => {
  // Lấy thông tin post hiện tại
  const currentPost = await DB.post.findUniqueOrThrow({
    where,
    select: {
      id: true,
      title: true,
      content: true,
      slug: true
    }
  });


  // Kiểm tra có thay đổi nội dung không
  const changedTitle = getFieldValue(data.title)?.trim();
  const changedContent = getFieldValue(data.content)?.trim();
  const hasTitleAndContentChanges = ((!!changedTitle || !!changedContent) && (
    (changedTitle !== currentPost.title.trim()) ||
    (changedContent !== currentPost.content.trim()))
  );

  if (!hasTitleAndContentChanges) {
    return DB.post.update({ where, data, select });
  }


  // Xử lý title và slug
  const newTitle = getFieldValue(data.title);
  const newSlug = newTitle ? createSlug(newTitle) : currentPost.slug;
  const updatedData = {
    ...data,
    ...(newTitle && {
      title: newTitle.substring(0, 255),
      slug: newSlug
    })
  };

  // Batch transaction
  return await DB.$transaction([
    // Query 1: Update post với title và slug mới
    DB.post.update({
      where,
      data: updatedData,
      select
    }),
    // Query 2: Đánh dấu các revision cũ là không active
    DB.postRevision.updateMany({
      where: { postId: currentPost.id },
      data: { isActive: false }
    }),
    // Query 3: Tạo revision mới
    DB.postRevision.create({
      data: {
        postId: currentPost.id,
        title: newTitle || currentPost.title,
        content: getFieldValue(data.content) || currentPost.content,
        slug: newSlug,
        isActive: true
      }
    }),
    // Query 4: Update postLog
    DB.postLog.updateMany({
      where: { postId: currentPost.id },
      data: { status: "NEED_SYNC" },
    })
  ]).then(([updatedPost, _, newRevision]) => {
    return updatedPost;
  });
}; 