import { z } from 'zod';

const paginationSchema = z.object({
  pageIndex: z
    .number()
    .min(1)
    .default(1)
    .transform((val) => val - 1),
  pageSize: z.number().min(0).max(128).default(32),
});
export type TPagination = z.infer<typeof paginationSchema>;
export const paginationOptions = (pagination?: Partial<TPagination>) => {
  const { pageIndex, pageSize } = paginationSchema.parse(pagination ?? {});
  return {
    limit: pageSize,
    offset: pageIndex * pageSize,
  };
};
