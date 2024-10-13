import { userRoleAssociation } from './associationResolvers/user-role.association';
import { RoleModel } from './role';
import User from './user';
import { DB } from '@/database/database';

export const modelInitiateResolver = async () => {
  DB.addModels([User.UserModel, RoleModel]);
  userRoleAssociation();

  await DB.sync({ logging: false, alter: true });
};
