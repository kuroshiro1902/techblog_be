import { EUserRoleAssociation } from '@/user/constants/associations/user-role.constant';
import { RoleModel } from '../role/role.model';
import { UserModel } from '../user/user.model';

// USER-ROLE ASSOCIATION - M:N
export const userRoleAssociation = () => {
  UserModel.belongsToMany(RoleModel, {
    through: EUserRoleAssociation.tableName,
    foreignKey: EUserRoleAssociation.userForeignKey,
    otherKey: EUserRoleAssociation.roleForeignKey,
    timestamps: true,
  });
  RoleModel.belongsToMany(UserModel, {
    through: EUserRoleAssociation.tableName,
    foreignKey: EUserRoleAssociation.roleForeignKey,
    otherKey: EUserRoleAssociation.userForeignKey,
    timestamps: true,
  });
};
