import { timestampSchema } from '@/common/models/timestamp/timestamp.type';
import { z } from 'zod';

// Định nghĩa enum cho các trường của Category
export enum ECategoryField {
  id = 'id',
  name = 'name',
  children = 'children',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
}

export const categoryFieldSchema = z.nativeEnum(ECategoryField);

export const categorySchema = z.object({
  [ECategoryField.id]: z
    .number({ message: 'ID phải là chữ số lớn hơn 0.' })
    .positive({ message: 'ID phải là chữ số lớn hơn 0.' })
    .max(Number.MAX_SAFE_INTEGER),
  [ECategoryField.name]: z
    .string().trim()
    .min(1, { message: 'Tên danh mục phải có ít nhất 1 ký tự.' })
    .max(255, { message: 'Tên danh mục không được vượt quá 255 ký tự.' }),
  ...timestampSchema(),
}).strict();

export const categoryWithChildrenSchema = categorySchema.extend({
  children: z.array(categoryFieldSchema).default([]),
});

export const createCategorySchema = categorySchema.pick({
  [ECategoryField.name]: true,
}).extend({
  [ECategoryField.children]: z.array(categorySchema.pick({
    [ECategoryField.id]: true,
  }).strict(),
  ).default([]),
}).strict();

export const CATEGORY_PUBLIC_FIELDS: ECategoryField[] = [
  ECategoryField.id,
  ECategoryField.name,
  ECategoryField.createdAt,
  ECategoryField.updatedAt,
  ECategoryField.children
] as const;
