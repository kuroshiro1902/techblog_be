import { TRole } from '../models/role/role.type';

export enum ERoleName {
  ADMIN = 'admin',
  USER = 'user',
}

export const ROLES = {
  [ERoleName.USER]: { id: 1, name: ERoleName.USER } as TRole,
  [ERoleName.ADMIN]: { id: 2, name: ERoleName.ADMIN } as TRole,
};
