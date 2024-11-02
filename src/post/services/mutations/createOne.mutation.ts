import { DB } from "@/database/database";
import { createPostSchema, EPostField, POST_PUBLIC_FIELDS } from "@/post/validators/post.schema";
import { EUserField, userSchema } from "@/user/validators/user.schema";
import slugify from "slugify";
import { uid } from "uid";
import { z } from "zod";

export const createOne = async (post: z.input<typeof createPostSchema>, authorId: number) => {
  const validatedPost = createPostSchema.parse(post);
  const validatedAuthorId = userSchema.shape[EUserField.id].parse(authorId);
  const slugLength = 10;
  const slug =
    slugify(validatedPost[EPostField.title], {
      trim: true,
      strict: true,
      locale: 'vi',
    }) +
    '-' +
    uid(slugLength);
  const createdPost = await DB.post.create({
    data: {
      ...validatedPost,
      title: validatedPost[EPostField.title].substring(0, 255 - slugLength - 1),
      slug,
      author: { connect: { id: validatedAuthorId } },
      categories: { connect: validatedPost[EPostField.categories] },
      PostLog: { create: { status: "NOT_SYNCED" } }
    },
    select: POST_PUBLIC_FIELDS.reduce((prev, curr) => {
      return { ...prev, [curr]: true };
    }, {} as Record<EPostField, boolean>),
  });

  return createdPost;
}