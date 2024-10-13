import { DB } from '@/database/database';

import { ERoleName, ROLES } from '../constants/role.constant';
import { paginationOptions, TPagination } from '@/common/models/pagination/pagination.model';
import { findUserQuery, TFindUserQuery } from './query/findUser.query';
import { TUser } from '../validators/user.schema';

// Refactored UserService
export const UserService = {
  async findAll(query?: TFindUserQuery, pagination?: TPagination) {
    const users = await DB.user.findMany({
      ...findUserQuery(query, pagination),
      include: { roles: { select: { id: true, name: true } } },
    });
    return users;
  },

  async findOne(query?: TFindUserQuery) {
    const users = await DB.user.findMany({
      ...findUserQuery(query, { pageSize: 1 }),
      include: { roles: { select: { id: true, name: true } } },
    });
    return users.pop() ?? null;
  },

  // async createUser(input: User.TUserCreate): Promise<User.TUser> {
  //   const userInput = User.userCreateSchema.parse(input);

  //   const createdUser = await DB.transaction(async (transaction) => {
  //     const user = await User.UserModel.create(userInput, { transaction });
  //     await user.$set(EUserRoleAssociation.roleAssociationKey, [ROLES[ERoleName.USER].id], {
  //       transaction,
  //     });
  //     return user;
  //   });
  //   createdUser.set(
  //     {
  //       [EUserRoleAssociation.roleAssociationKey]: [
  //         { name: ROLES[ERoleName.USER].name } as Role.TRole,
  //       ],
  //     },
  //     { raw: true }
  //   );
  //   return UserServiceHelper.mapToPlainUser(createdUser);
  // },

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
