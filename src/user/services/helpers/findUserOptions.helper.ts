import { EUserRoleAssociation } from '@/user/constants/associations/user-role.constant';
import { RoleModel } from '@/user/models/role';
import User from '@/user/models/user';
import { userAttributeSchema } from '@/user/models/user/user.type';
import { FindOptions } from 'sequelize';
import { z } from 'zod';

const defaultUserAttributes: User.TUserAttribute[] = [
  'id',
  'avatarUrl',
  'description',
  'dob',
  'email',
  'name',
];

export interface IFindUserOptions {
  /**
   * Các thuộc tính ngoại.
   *
   * Sau nếu user có các khóa ngoại khác thì thay 'test' bằng các thuộc tính đến khóa ngoại đó.
   *
   */
  includes?: (EUserRoleAssociation.roleAssociationKey | 'test')[];
  attributes?: User.TUserAttribute[];
}

const roleInclude: FindOptions['include'] = {
  model: RoleModel,
  as: EUserRoleAssociation.roleAssociationKey,
  through: { attributes: [] },
};

const includesSchema = z
  .array(z.enum([EUserRoleAssociation.roleAssociationKey]))
  .default([EUserRoleAssociation.roleAssociationKey]);

export const findUserOptions = (
  options?: IFindUserOptions
): Omit<FindOptions<User.TUser>, 'where'> => {
  // include
  const include: FindOptions<User.TUser>['include'] = (() => {
    const defaultInclude: FindOptions<User.TUser>['include'] = includesSchema.parse(
      options?.includes
    );
    const includeLen = options?.includes?.length ?? 0;
    if (includeLen === 0) {
      // mặc định là include tất cả quan hệ
      return defaultInclude;
    }
    if (options?.includes?.includes(EUserRoleAssociation.roleAssociationKey)) {
      defaultInclude.push(roleInclude);
    }
    return [];
  })();

  // attributes
  const attributes: User.TUserAttribute[] = (() => {
    const attrLen = options?.attributes?.length ?? 0;
    if (attrLen === 0) {
      return [...defaultUserAttributes];
    }
    if (attrLen > 0) {
      const validatedAttrs =
        options?.attributes?.map((attr) =>
          userAttributeSchema.exclude(['username', 'password']).parse(attr)
        ) ?? [];
      return validatedAttrs;
    }
    return [];
  })();

  //
  return { include, attributes };
};
