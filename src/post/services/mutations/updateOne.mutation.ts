import { DB } from "@/database/database";
import { updatePostSchema, EPostField, POST_PUBLIC_FIELDS, postSchema } from "@/post/validators/post.schema";
import { EUserField, userSchema } from "@/user/validators/user.schema";
import slugify from "slugify";
import { uid } from "uid";
import { z } from "zod";
import { updatePostWithRevision } from '../helpers/post-versioning.helper';
import { createSlug } from "../helpers/create-slug.helper";

export const updateOne = async (postId: number, post: z.input<typeof updatePostSchema>, authorId: number) => {
  const validatedPost = updatePostSchema.parse(post);
  const validatedPostId = postSchema.shape[EPostField.id].parse(postId);
  const validatedAuthorId = userSchema.shape[EUserField.id].parse(authorId);

  return updatePostWithRevision({
    where: {
      id: validatedPostId,
      authorId: validatedAuthorId
    },
    data: {
      ...validatedPost,
      author: { connect: { id: validatedAuthorId } },
      categories: { set: validatedPost[EPostField.categories] }
    },
    select: {
      ...POST_PUBLIC_FIELDS.reduce((prev, curr) => {
        return { ...prev, [curr]: true };
      }, {} as Record<EPostField, boolean>), isPublished: true
    },
  });
};