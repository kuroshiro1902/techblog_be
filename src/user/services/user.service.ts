import { DB } from '@/database/database';

import { ERoleName, ROLES } from '../constants/role.constant';
import User from '../models/user';
import { paginationOptions, TPagination } from '@/common/models/pagination/pagination.type';
import UserServiceHelper from './helpers';
import { searchUserQuery, TSearchUserQuery } from './query/searchUser.query';
import { EUserRoleAssociation } from '../constants/associations/user-role.constant';
import { Role } from '../models/role';

// Refactored UserService
export const UserService = {
  async findAllBy(
    query?: TSearchUserQuery,
    pagination?: Partial<TPagination>,
    options?: UserServiceHelper.IFindUserOptions
  ): Promise<User.TUser[]> {
    const users = await User.UserModel.findAll({
      where: searchUserQuery(query),
      ...paginationOptions(pagination ?? {}),
      ...UserServiceHelper.findUserOptions(options),
    });

    return users.map(UserServiceHelper.mapToPlainUser);
  },

  async findOneBy(
    filter: { id: number },
    options?: UserServiceHelper.IFindUserOptions
  ): Promise<User.TUser | null> {
    const userId = User.userSchema.shape.id.parse(filter.id);
    const user = await User.UserModel.findOne({
      where: { id: userId },
      limit: 1,
      ...options,
    });

    return user ? UserServiceHelper.mapToPlainUser(user) : null;
  },

  async createUser(input: User.TUserCreate): Promise<User.TUser> {
    const userInput = User.userCreateSchema.parse(input);

    const createdUser = await DB.transaction(async (transaction) => {
      const user = await User.UserModel.create(userInput, { transaction });
      await user.$set(EUserRoleAssociation.roleAssociationKey, [ROLES[ERoleName.USER].id], {
        transaction,
      });
      return user;
    });
    createdUser.set(
      {
        [EUserRoleAssociation.roleAssociationKey]: [
          { name: ROLES[ERoleName.USER].name } as Role.TRole,
        ],
      },
      { raw: true }
    );
    return UserServiceHelper.mapToPlainUser(createdUser);
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
