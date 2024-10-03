import { DB } from '@/database/database';
import { FindOptions } from 'sequelize';
import { z } from 'zod';
import { Role } from '../models/role.model';
import { IUser } from '../models/types/user.type';
import { User, UserModel } from '../models/user.model';
import { DEFAULT_ROLE_ID } from '../constants/role.constant';

const defaultPageSize = 50;
const rolesRelationKey: keyof UserModel = 'roles';

const userFindOptions: FindOptions = {
  include: [
    {
      model: Role.model,
      as: rolesRelationKey,
      through: { attributes: [] }, // Không lấy ra bảng trung gian
    },
  ],
};

const parseUserFilter = (
  filter: Partial<IUser>,
  omitKeys: (keyof IUser)[] = []
) => {
  // Loại bỏ các thuộc tính chỉ định trong omitKeys
  const schemaToParse = User.schema.omit(
    omitKeys.reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<keyof IUser, true>)
  );

  return schemaToParse.partial().parse(filter);
};

// Helper function to map user to plain object
const mapToPlainUser = (user: UserModel): IUser => user.get({ plain: true });

// Refactored UserService
export const UserService = {
  async findAllBy(
    filter: Partial<IUser>,
    limit: number = defaultPageSize
  ): Promise<IUser[]> {
    const parsedFilter = parseUserFilter(filter);
    const users = await User.model.findAll({
      where: parsedFilter,
      limit,
      ...userFindOptions,
    });

    return users.map(mapToPlainUser);
  },

  async findOneBy(filter: Partial<IUser>): Promise<IUser | null> {
    const parsedFilter = parseUserFilter(filter);
    const user = await User.model.findOne({
      where: parsedFilter,
      ...userFindOptions,
    });

    return user ? mapToPlainUser(user) : null;
  },

  async createUser(filter: Omit<IUser, 'id'>): Promise<IUser> {
    const userInput = parseUserFilter(filter, ['id']);

    const createdUser = await DB.transaction(async (transaction) => {
      const user = await User.model.create(userInput as IUser, { transaction });
      await user.$set(rolesRelationKey, [DEFAULT_ROLE_ID], { transaction });
      return user;
    });

    const reloadedUser = await createdUser.reload(userFindOptions);
    return mapToPlainUser(reloadedUser);
  },

  async updateUser(
    userId: number,
    patchValue: z.infer<typeof User.updateSchema>
  ): Promise<IUser> {
    const parsedUserId = User.schema.shape.id.parse(userId);
    const parsedPatchValue = User.updateSchema.parse(patchValue);

    const user = await User.model.findByPk(parsedUserId);
    if (!user) {
      throw new Error(`Không tìm thấy user với id ${parsedUserId}`);
    }

    const updatedUser = await user.update(parsedPatchValue);
    return mapToPlainUser(updatedUser);
  },
};
