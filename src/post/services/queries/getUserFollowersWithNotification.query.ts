import { DB } from "@/database/database";
import { userSchema } from "@/user/validators/user.schema";
import { EUserField } from "@/user/validators/user.schema";
import { User } from "@prisma/client";
export const getUserFollowersWithNotification = async (userId$: number): Promise<Pick<User, 'id' | 'name'>[]> => {
  const userId = userSchema.shape[EUserField.id].parse(userId$);
  console.log('Getting followers for user:', userId);

  const followers = await DB.userFollow.findMany({
    where: {
      followingId: userId,  // ID của người được follow
      notification: true    // Chỉ lấy những người có bật thông báo
    },
    select: {
      follower: {          // Lấy thông tin của người follow
        select: {
          id: true,
          name: true,
        }
      },
      followerId: true,    // Thêm followerId để dễ dàng truy cập
      notification: true    // Thêm trường notification để kiểm tra
    }
  });

  console.log('Found followers with notifications:', followers);
  return followers.map(({ follower }) => follower);
}