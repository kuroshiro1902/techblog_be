import {
  paginationOptions,
  paginationSchema,
  TPageInfo,
} from '@/common/models/pagination/pagination.model';
import { DB } from '@/database/database';
import { categorySchema, ECategoryField } from '@/category/validators/category.schema';
import {
  EPostField,
  POST_PUBLIC_FIELDS,
  postFieldSchema,
  postSchema,
  TPost,
} from '@/post/validators/post.schema';
import { EUserField, userSchema } from '@/user/validators/user.schema';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { TRating } from '@/post/validators/rating.schema';

const findUniquePostQuerySchema = z.object({
  fields: z.array(postFieldSchema).default(POST_PUBLIC_FIELDS),
  input: z.object({
    slug: z.string().trim().max(255),
    isPublished: postSchema.shape.isPublished,
  }),
});


export type TFindUniquePostQuery = Partial<z.input<typeof findUniquePostQuerySchema>>;

export const findUnique = async (query$?: TFindUniquePostQuery): Promise<TPost | null> => {
  const query = findUniquePostQuerySchema.parse(query$);
  const {
    input,
    fields,
  } = query;

  // WHERE
  const { slug, isPublished } = input
  const where: Prisma.PostWhereUniqueInput = { isPublished, slug };

  // SELECT
  const select: Prisma.PostSelect = (
    fields && fields.length > 0 ? fields : POST_PUBLIC_FIELDS
  ).reduce((prev, field) => ({ ...prev, [field]: true }), {} as Record<EPostField, true>);
  if (select.author) {
    select.author = { select: { [EUserField.id]: true, [EUserField.name]: true } };
  }
  if (select.categories) {
    select.categories = { select: { [ECategoryField.id]: true, [ECategoryField.name]: true } };
  }

  // Fetch posts
  const post = await DB.post.findUnique({ where, select });
  if (!post?.id) {
    return null;
  }

  const rating = (await DB.rating.groupBy({
    by: ['postId'], //Tính trung bình đánh giá theo từng post
    _avg: {
      score: true
    },
    where: { postId: post.id },
  }))?.[0]?._avg ?? { score: null };

  // Return data with pageInfo
  return {
    ...post,
    rating: { score: rating.score || undefined }
  };
};
