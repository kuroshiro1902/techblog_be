import { z } from 'zod';
import { findMany, TFindPostQuery } from './queries/findMany.query';
import {
  createPostSchema,
  EPostField,
  POST_PUBLIC_FIELDS,
  postSchema,
} from '../validators/post.schema';
import { DB } from '@/database/database';
import slugify from 'slugify';
import { uid } from 'uid';
import { EUserField, userSchema } from '@/user/validators/user.schema';

export const PostService = {
  findMany,
  async create(post: z.input<typeof createPostSchema>, authorId: number) {
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
      },
      select: POST_PUBLIC_FIELDS.reduce((prev, curr) => {
        return { ...prev, [curr]: true };
      }, {} as Record<EPostField, boolean>),
    });

    return createdPost;
  },
};
