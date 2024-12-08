import { paginationOptions, paginationSchema, TPagination } from "@/common/models/pagination/pagination.model";
import { DB } from "@/database/database";
import { EUserField } from "@/user/validators/user.schema";
import { userSchema } from "@/user/validators/user.schema";
import { EPostField } from "@/post/validators/post.schema";

type TGetFavoritePostsParams = TPagination & {
  userId: number;
};

export const getFavoritePosts = async ({
  userId,
  pageIndex: pageIndex$,
  pageSize: pageSize$
}: TGetFavoritePostsParams) => {
  const pagination = paginationSchema.parse({ pageIndex: pageIndex$, pageSize: pageSize$ });
  const { skip, take, pageIndex, pageSize } = paginationOptions(pagination);

  // Kiểm tra userId
  userSchema.shape[EUserField.id].parse(userId);

  const [totalCount, favoritePosts] = await Promise.all([
    DB.userFavoritePost.count({
      where: { userId }
    }),
    DB.userFavoritePost.findMany({
      where: { userId },
      take,
      skip,
      select: {
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
          }
        },
        createdAt: true
      }
    })
  ]);

  const hasNextPage = skip + favoritePosts.length < totalCount;
  const totalPage = Math.ceil(totalCount / pageSize);
  return {
    data: favoritePosts,
    pageInfo: {
      pageIndex,
      pageSize,
      totalCount,
      totalPage,
      hasNextPage
    }
  };
};
