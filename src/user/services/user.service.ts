import { DB } from '@/database/database';
import {
  EUserField,
  TUserCreateInput,
  USER_PUBLIC_FIELDS,
  USER_PUBLIC_FIELDS_SELECT,
  userCreateSchema,
  userSchema,
} from '../validators/user.schema';
import { findMany, TUserFindManyQuery } from './queries/findMany.query';
import { ERoleName, ROLES } from '../constants/role.constant';
import { updateOneExceptPassword } from './mutations/updateOneExceptPassword.mutation';
import { findUnique } from './queries/findUnique.query';
import { updatePassword } from './mutations/updatePassword.mutation';
import { followUser } from './mutations/followUser.mutation';
import { updateFollowNotification } from './mutations/updateFollowNotification.mutation';
import { findFollowers } from './queries/findFollowers.query';
import { findFollowing } from './queries/findFollowing.query';

export const UserService = {
  findUnique,
  findMany,
  updateOneExceptPassword,
  async findOne(query: TUserFindManyQuery) {
    const users = await this.findMany({ ...query, pageSize: 1 });
    return users.pop();
  },

  async createUser(input: TUserCreateInput) {
    const userInput = userCreateSchema.parse(input);
    const createdUser = await DB.user.create({
      data: { ...userInput, [EUserField.roles]: { connect: { id: ROLES[ERoleName.USER].id } } },
      select: USER_PUBLIC_FIELDS.reduce((prev, curr) => {
        return { ...prev, [curr]: true };
      }, {} as Record<EUserField, boolean>),
    });
    return createdUser;
  },
  updatePassword,
  followUser,
  updateFollowNotification,
  findFollowers,
  findFollowing,
};
