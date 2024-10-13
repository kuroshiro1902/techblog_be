import { z } from 'zod';

export const baseCategorySchema = z.object({
  id: z.number().positive(),
  name: z
    .string()
    .min(3, { message: 'Tên thể loại ít nhất 3 ký tự.' })
    .max(32, { message: 'Tên thể loại nhiều nhất 32 ký tự.' }),
  /** Url ảnh hoặc icon class, icon html, ... */
  icon: z.string().max(255).optional(),
});

export type ICategory = z.infer<typeof baseCategorySchema> & {
  children?: ICategory[];
};

export const categorySchema: z.ZodType<ICategory> = baseCategorySchema.extend({
  children: z.lazy(() => z.array(categorySchema).optional()),
});

export const categoryUpdateSchema = z.object({
  name: baseCategorySchema.shape.name.optional(),
});
