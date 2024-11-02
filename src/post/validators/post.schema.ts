import { timestampSchema } from '@/common/models/timestamp/timestamp.type';
import { EUserField, userSchema } from '@/user/validators/user.schema';
import { z } from 'zod';
import { categorySchema, ECategoryField } from '../../category/validators/category.schema';

export enum EPostField {
  id = 'id',
  title = 'title',
  slug = 'slug',
  content = 'content',
  thumbnailUrl = 'thumbnailUrl',
  isPublished = 'isPublished',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
  author = 'author',
  categories = 'categories'
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
  [EPostField.slug]: z
    .string()
    .min(1, { message: 'Slug phải có ít nhất 1 ký tự.' })
    .max(255, { message: 'Slug không được vượt quá 255 ký tự.' }),
  [EPostField.content]: z
    .string()
    .min(1, { message: 'Nội dung bài viết không được bỏ trống.' }),
  [EPostField.thumbnailUrl]: z
    .string()
    .max(255, { message: 'Url thumbnail không được vượt quá 500 ký tự.' })
    .optional(),
  [EPostField.isPublished]: z.boolean().default(true),
  [EPostField.author]: userSchema
    .pick({ [EUserField.id]: true, [EUserField.name]: true, [EUserField.avatarUrl]: true })
    .partial()
    .optional(),
  [EPostField.categories]: z.array(categorySchema.pick({ [ECategoryField.id]: true })).default([]),
  ...timestampSchema(),
}).strict();

export const createPostSchema = postSchema.pick({
  [EPostField.title]: true,
  [EPostField.content]: true,
  [EPostField.isPublished]: true,
  [EPostField.thumbnailUrl]: true,
  [EPostField.categories]: true
}).strict();

export const POST_PUBLIC_FIELDS: EPostField[] = [
  EPostField.id,
  EPostField.title,
  EPostField.content,
  EPostField.createdAt,
  EPostField.thumbnailUrl,
  EPostField.slug,
  EPostField.author,
  EPostField.categories
] as const;
