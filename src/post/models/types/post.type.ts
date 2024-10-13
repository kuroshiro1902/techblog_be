import { z } from 'zod';
import { baseCategorySchema, categorySchema } from './category.type';
import { userSchema } from '@/user/models/user/user.type';

export const postSchema = z.object({
  id: z.number().positive(),
  name: z
    .string()
    .min(1, { message: 'Tên phải có ít nhất 1 ký tự.' })
    .max(255, { message: 'Tên tối đa 255 ký tự.' }),
  thumbnailUrl: z.string().max(255).optional(),
  content: z
    .string()
    .max(7500, { message: 'Nội dung bài viết tối đa 7500 ký tự.' })
    .trim(),
  author: userSchema.pick({
    id: true,
    name: true,
    avatarUrl: true,
    description: true,
    dob: true,
    email: true,
  }),
  categories: z.array(categorySchema).optional(),
});

export const postUpdateSchema = z.object({
  name: postSchema.shape.name.optional(),
  thumbnailUrl: postSchema.shape.thumbnailUrl.optional(),
  content: postSchema.shape.content,
  categories: z.array(baseCategorySchema.shape.id).optional(),
});

export type IPost = z.infer<typeof postSchema>;
