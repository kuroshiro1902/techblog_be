import { DB } from '@/database/database';
import { Prisma } from '@prisma/client';
import { createSlug } from './create-slug.helper';
import { Logger } from '@/common/utils/logger.util';

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
  try {
    // Lấy thông tin post hiện tại
    const currentPost = await DB.post.findUniqueOrThrow({
      where,
      select: {
        id: true,
        title: true,
        content: true,
        slug: true,
        isPublished: true,
        categories: {
          select: { id: true }
        }
      }
    });

    // Kiểm tra thay đổi
    const changedTitle = getFieldValue(data.title)?.trim();
    const changedContent = getFieldValue(data.content)?.trim();

    const hasTitleAndContentChanges = ((!!changedTitle || !!changedContent) && (
      (changedTitle !== currentPost.title.trim()) ||
      (changedContent !== currentPost.content.trim())
    ));

    // Kiểm tra thay đổi categories
    const newCategories = data.categories?.set as { id: number }[] | undefined;
    const currentCategoryIds = new Set(currentPost.categories.map(c => c.id));
    const hasChangedCategories = newCategories?.some(c => !currentCategoryIds.has(c.id))
      || newCategories?.length !== currentPost.categories.length;

    // Mở rộng kiểm tra các trường ảnh hưởng đến search
    const hasSearchRelevantChanges = (
      hasTitleAndContentChanges ||
      data.isPublished !== undefined ||
      hasChangedCategories
    );

    if (!hasSearchRelevantChanges) {
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
      // 1. Update post
      DB.post.update({
        where,
        data: updatedData,
        select
      }),

      // 2. Update revisions nếu có thay đổi content/title
      ...(hasTitleAndContentChanges ? [
        DB.postRevision.updateMany({
          where: { postId: currentPost.id },
          data: { isActive: false }
        }),
        DB.postRevision.create({
          data: {
            postId: currentPost.id,
            title: newTitle || currentPost.title,
            content: getFieldValue(data.content) || currentPost.content,
            slug: newSlug,
            isActive: true
          }
        })
      ] : []),

      // 3. Update postLog để đánh dấu cần sync
      DB.postLog.updateMany({
        where: { postId: currentPost.id },
        data: { status: "NEED_SYNC" },
      })
    ]).then(([updatedPost]) => updatedPost);

  } catch (error) {
    // Log error
    await Logger.error(`Error updating post ${where.id}: ${error}`);
    throw error;
  }
}; 