import { createUserRoleAssociation } from './associations/user-role.association';
import { Role } from './role.model';
import { User } from './user.model';
import { DB } from '@/database/database';

export const initUserModels = async () => {
  DB.addModels([User.model, Role.model]);

  createUserRoleAssociation();

  await DB.sync({ logging: false, alter: true });
};
