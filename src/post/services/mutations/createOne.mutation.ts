import { DB } from "@/database/database";
import { createPostSchema, EPostField, POST_PUBLIC_FIELDS } from "@/post/validators/post.schema";
import { EUserField, userSchema } from "@/user/validators/user.schema";
import { createSlug } from "../helpers/create-slug.helper";
import { z } from "zod";

export const createOne = async (post: z.input<typeof createPostSchema>, authorId: number) => {
  const validatedPost = createPostSchema.parse(post);
  const validatedAuthorId = userSchema.shape[EUserField.id].parse(authorId);

  // Tạo slug từ title
  const slug = createSlug(validatedPost[EPostField.title]);
  const title = validatedPost[EPostField.title].substring(0, 255);

  return await DB.$transaction(async (tx) => {
    // Query 1: Tạo post mới
    const createdPost = await tx.post.create({
      data: {
        ...validatedPost,
        title,
        slug,
        author: { connect: { id: validatedAuthorId } },
        categories: { connect: validatedPost[EPostField.categories] },
        PostLog: { create: { status: "NOT_SYNCED" } }
      },
      select: {
        ...POST_PUBLIC_FIELDS.reduce((prev, curr) => {
          return { ...prev, [curr]: true };
        }, {} as Record<EPostField, boolean>), isPublished: true
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
};