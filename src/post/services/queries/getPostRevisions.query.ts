import { paginationOptions, paginationSchema, TPageInfo } from "@/common/models/pagination/pagination.model";
import { DB } from "@/database/database";
import { Prisma } from "@prisma/client";

type TGetPostRevisionsParams = {
  postId: number;
  authorId: number;
  pageIndex?: number;
  pageSize?: number;
};

export const getPostRevisions = async ({
  postId,
  authorId,
  pageIndex = 1,
  pageSize = 10
}: TGetPostRevisionsParams) => {
  const { skip, take } = paginationOptions(paginationSchema.parse({ pageIndex, pageSize }));
  // Kiểm tra quyền truy cập
  const post = await DB.post.findFirstOrThrow({
    where: {
      id: postId,
      authorId
    },
    select: { id: true }
  });

  // Lấy danh sách revisions với phân trang
  const [revisions, total] = await Promise.all([
    DB.postRevision.findMany({
      where: { postId },
      select: {
        id: true,
        title: true,
        content: true,
        slug: true,
        isActive: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take
    }),
    DB.postRevision.count({
      where: { postId }
    })
  ]);

  const totalPage = Math.ceil(total / pageSize);
  const hasNextPage = skip + revisions.length < total;

  return {
    data: revisions,
    pageInfo: {
      pageIndex,
      pageSize,
      totalPage,
      hasNextPage
    } as TPageInfo
  };
}; 