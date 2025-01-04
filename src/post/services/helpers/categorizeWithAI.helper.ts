import { categoryNameCache } from "@/cache/category.cache";
import { DB } from "@/database/database";
import { NotificationService } from "@/notification/services/notification.service";
import { OpenAIService } from "@/openai/openai.service";
import { createPostSchema } from "@/post/validators/post.schema";
import { Post, User } from "@prisma/client";
import { z } from "zod";

export const categorizeWithAI = async (post: Pick<Post, 'id' | 'description'>) => {
  const { id, description } = post;
  if (!description) return [];

  try {
    // Nếu cache trống, tải dữ liệu từ cơ sở dữ liệu
    if (categoryNameCache.size === 0) {
      const dbCategories = await DB.category.findMany({ select: { name: true } });
      dbCategories.forEach((category) => categoryNameCache.add(category.name));
    }
    // Gọi AI để phân loại
    const categories = await OpenAIService.categorizePost(description);

    console.log('AI PHÂN LOẠI: ', { categories });

    // Tạo các category mới (nếu có)
    const newCategories = categories.filter((name) => !categoryNameCache.has(name));
    if (newCategories.length > 0) {
      await DB.category.createMany({
        data: newCategories.map((name) => ({ name })),
        skipDuplicates: true,
      });
      newCategories.forEach((name) => categoryNameCache.add(name)); // Cập nhật cache
    }

    // Liên kết tất cả category với bài viết và cập nhật lại postlog
    await DB.$transaction([
      DB.post.update({
        where: { id },
        data: {
          categories: {
            connect: categories.map((name) => ({ name })), // Prisma hỗ trợ connect trực tiếp bằng `name`
          },
        },
      }),
      DB.postLog.updateMany({
        where: { postId: id },
        data: { status: 'NEED_SYNC' }
      })
    ])

    return categories;
  } catch (error) {
    console.error('Error during post creation post-process:', error);
    return [];
  }
}