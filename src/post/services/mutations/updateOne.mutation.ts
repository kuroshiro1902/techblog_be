import { DB } from "@/database/database";
import { updatePostSchema, EPostField, POST_PUBLIC_FIELDS, postSchema } from "@/post/validators/post.schema";
import { EUserField, userSchema } from "@/user/validators/user.schema";
import slugify from "slugify";
import { uid } from "uid";
import { z } from "zod";

export const updateOne = async (postId: number, post: z.input<typeof updatePostSchema>, authorId: number) => {
  const validatedPost = updatePostSchema.parse(post);
  const validatedPostId = postSchema.shape[EPostField.id].parse(postId);
  const validatedAuthorId = userSchema.shape[EUserField.id].parse(authorId);
  const slugUidLength = 10;
  const slug = validatedPost[EPostField.title] ?
    slugify(validatedPost[EPostField.title], {
      trim: true,
      strict: true,
      locale: 'vi',
    }) +
    '-' +
    uid(slugUidLength) : undefined;

  const updatedPost = await DB.$transaction(async (tx) => {
    const updatedPost = await tx.post.update({
      data: {
        ...validatedPost,
        title: validatedPost[EPostField.title]?.substring?.(0, 255 - slugUidLength - 1),
        slug,
        author: { connect: { id: validatedAuthorId } },
        categories: { set: validatedPost[EPostField.categories] },
      },
      where: { id: validatedPostId, authorId: validatedAuthorId },
      select: POST_PUBLIC_FIELDS.reduce((prev, curr) => {
        return { ...prev, [curr]: true };
      }, {} as Record<EPostField, boolean>),
    });
    await tx.postLog.updateMany({
      where: { postId: validatedPostId },
      data: { status: "NEED_SYNC" },
    });
    return updatedPost;
  })

  return updatedPost;
}