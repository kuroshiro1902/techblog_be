import { timestampSchema } from '@/common/models/timestamp/timestamp.type';
import { EUserField, userSchema } from '@/user/validators/user.schema';
import { z } from 'zod';
import { categorySchema, ECategoryField } from '../../category/validators/category.schema';
import { TRating } from './rating.schema';
import { TRatingInfo } from './ratingInfo.schema';

export enum EPostField {
  id = 'id',
  title = 'title',
  slug = 'slug',
  content = 'content',
  description = 'description',
  thumbnailUrl = 'thumbnailUrl',
  isPublished = 'isPublished',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
  author = 'author',
  categories = 'categories',
  views = 'views',
  ratings = 'ratings',
  comments = 'comments'
}

export const postFieldSchema = z.nativeEnum(EPostField);

export const postSchema = z.object({
  [EPostField.id]: z
    .number({ message: 'ID phải là chữ số lớn hơn 0.' })
    .positive({ message: 'ID phải là chữ số lớn hơn 0.' })
    .max(Number.MAX_SAFE_INTEGER),

  [EPostField.title]: z
    .string()
    .min(1, { message: 'Tiêu đề phải có ít nhất 1 ký tự.' })
    .max(255, { message: 'Tiêu đề không được vượt quá 255 ký tự.' }),

  [EPostField.description]: z
    .string().max(5000).optional(),

  [EPostField.slug]: z
    .string()
    .min(1, { message: 'Slug phải có ít nhất 1 ký tự.' })
    .max(255, { message: 'Slug không được vượt quá 255 ký tự.' }),

  [EPostField.content]: z
    .string()
    .min(1, { message: 'Nội dung bài viết không được bỏ trống.' }),

  [EPostField.thumbnailUrl]: z
    .string()
    .max(500, { message: 'Url thumbnail không được vượt quá 500 ký tự.' }).nullable()
    .nullable().optional(),

  [EPostField.isPublished]: z.boolean().nullable().optional(),

  [EPostField.views]: z.number().default(0),

  [EPostField.categories]: z
    .array(
      z.object({
        [ECategoryField.id]: categorySchema.shape[ECategoryField.id],
        [ECategoryField.name]: categorySchema.shape[ECategoryField.name].optional()
      })
    )
    .default([]),

  [EPostField.author]: userSchema
    .pick({
      [EUserField.id]: true,
      [EUserField.name]: true,
      [EUserField.avatarUrl]: true
    })
    .nullable().optional(),

  ...timestampSchema(),
}).strict();

export type TPost = z.infer<typeof postSchema> & { rating: TRatingInfo }

export const createPostSchema = postSchema.pick({
  [EPostField.title]: true,
  [EPostField.content]: true,
  [EPostField.isPublished]: true,
  [EPostField.thumbnailUrl]: true,
  [EPostField.categories]: true,
  [EPostField.description]: true
}).strict();

export const updatePostSchema = createPostSchema.merge(postSchema.pick({ [EPostField.views]: true })).partial();

export const POST_PUBLIC_FIELDS: EPostField[] = [
  EPostField.id,
  EPostField.title,
  EPostField.content,
  EPostField.views,
  EPostField.createdAt,
  EPostField.thumbnailUrl,
  EPostField.slug,
  EPostField.author,
  EPostField.categories,
  EPostField.isPublished,
  EPostField.description
  // EPostField.comments
] as const;
