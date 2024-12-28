import { DB } from "@/database/database";
import { createPostSchema, EPostField, POST_PUBLIC_FIELDS } from "@/post/validators/post.schema";
import { EUserField, userSchema } from "@/user/validators/user.schema";
import { createSlug } from "../helpers/create-slug.helper";
import { z } from "zod";
import { NotificationService } from "@/notification/services/notification.service";
import { OpenAIService } from "@/openai/openai.service";
import { categoryNameCache } from "@/cache/category.cache";
import { categorizeWithAI } from "../helpers/categorizeWithAI.helper";

export const createOne = async (
  post: z.input<typeof createPostSchema>,
  authorId: number,
  useCategorize$ = false
) => {
  const validatedPost = createPostSchema.parse(post);
  const validatedAuthorId = userSchema.shape[EUserField.id].parse(authorId);

  // Kiểm tra nội dung và tạo summary cho bài viết
  const description = await OpenAIService.summaryContent(validatedPost[EPostField.content]);

  // Tạo slug từ title
  const slug = createSlug(validatedPost[EPostField.title]);
  const title = validatedPost[EPostField.title].substring(0, 255);

  const createdPost = await DB.$transaction(async (tx) => {
    // Query 1: Tạo post mới
    const createdPost = await tx.post.create({
      data: {
        ...validatedPost,
        title,
        slug,
        description,
        author: { connect: { id: validatedAuthorId } },
        categories: { connect: validatedPost[EPostField.categories] },
        PostLog: { create: { status: 'NOT_SYNCED' } }
      },
      select: {
        ...POST_PUBLIC_FIELDS.reduce((prev, curr) => {
          return { ...prev, [curr]: true };
        }, {} as Record<EPostField, boolean>),
        isPublished: true
      },
    });

    // Query 2: Tạo revision đầu tiên và active
    await tx.postRevision.create({
      data: {
        postId: createdPost.id,
        title,
        content: validatedPost[EPostField.content],
        slug,
        isActive: true
      }
    });

    return createdPost;
  });

  // Gửi thông báo nếu bài viết được public
  if (createdPost.isPublished) {
    const { author, id, slug, title, createdAt } = createdPost;
    NotificationService.handleNewPost({ post: { id, slug, title, createdAt, author: { id: author.id, name: author.name } } }, 'create');
  }

  // Tự động phân loại bài viết nếu được chỉ định
  const { data: useCategorize } = z.boolean().default(false).safeParse(useCategorize$);
  if (useCategorize) {
    categorizeWithAI({ id: createdPost.id, description: createdPost.description });
  }

  return createdPost;
};
