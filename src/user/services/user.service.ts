import { DB } from '@/database/database';

import { TPagination } from '@/common/models/pagination/pagination.model';
import { findUserQuery, TFindUserQuery } from './query/findUser.query';
import {
  EUserField,
  TUserCreateInput,
  USER_PUBLIC_FIELDS,
  userCreateSchema,
} from '../validators/user.schema';
import { findMany, TUserFindManyQuery } from './queries/findMany.query';
import { ERoleName, ROLES } from '../constants/role.constant';

export const UserService = {
  findMany,

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

  // async updateUser(
  //   userId: number,
  //   patchValue: Omit<User.TUser, 'id' | 'username'>
  // ): Promise<User.TUser> {
  //   const parsedUserId = User.userSchema.shape.id.parse(userId);
  //   const parsedPatchValue = User.userSchema
  //     .omit({ id: true, username: true })
  //     .parse(patchValue);

  //   const user = await User.UserModel.findByPk(parsedUserId);
  //   if (!user) {
  //     throw new Error(`Không tìm thấy user với id ${parsedUserId}`);
  //   }

  //   const updatedUser = await DB.transaction(async (transaction) => {
  //     const updatedUser = await user.update(parsedPatchValue, { transaction });
  //     await updatedUser.$set(EUserRoleAssociation.roleAssociationKey, parsedPatchValue);
  //   });
  //   return UserServiceHelper.mapToPlainUser(updatedUser);
  // },
};
