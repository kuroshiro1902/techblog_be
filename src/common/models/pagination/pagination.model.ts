import { z } from 'zod';

const defaultPageSize = 32;
const defaultPageIndex = 1;
export const paginationSchema = z
  .object({
    pageIndex: z
      .number({ message: 'Số trang phải là chữ số nguyên lớn hơn 0.' })
      .int({ message: 'Số trang phải là chữ số nguyên lớn hơn 0.' })
      .positive({ message: 'Số trang phải là chữ số nguyên lớn hơn 0.' }),
    pageSize: z
      .number({ message: 'Kích thước trang phải là chữ số trong khoảng 0 - 128.' })
      .min(0, { message: 'Kích thước trang phải lớn hơn hoặc bằng 0.' })
      .max(128, { message: 'Kích thước trang phải nhỏ hơn hoặc bằng 128.' }),
  })
  .partial();
export type TPagination = Partial<z.infer<typeof paginationSchema>>;
export const paginationOptions = (pagination?: TPagination) => {
  const { pageIndex = defaultPageIndex, pageSize = defaultPageSize } = pagination ?? {};
  return {
    skip: (pageIndex - 1) * pageSize,
    take: pageSize,
    pageIndex,
    pageSize,
  };
};

export type TPageInfo = {
  pageIndex: number;
  pageSize: number;
  totalPage: number;
  hasNextPage: boolean;
};
