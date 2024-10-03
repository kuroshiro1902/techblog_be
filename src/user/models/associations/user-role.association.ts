import { Role } from '../role.model';
import { User } from '../user.model';

export const userRoleAssociation = {
  tableName: 'user_role',
  userForeignKey: 'user_id',
  roleForeignKey: 'role_id',
  roleAssociationAlias: 'roles',
  usersAssociationAlias: 'user',
};

// USER-ROLE ASSOCIATION - M:N
export const createUserRoleAssociation = () => {
  User.model.belongsToMany(Role.model, {
    through: userRoleAssociation.tableName,
    foreignKey: userRoleAssociation.userForeignKey,
    otherKey: userRoleAssociation.roleForeignKey,
    timestamps: true,
  });
  Role.model.belongsToMany(User.model, {
    through: userRoleAssociation.tableName,
    foreignKey: userRoleAssociation.roleForeignKey,
    otherKey: userRoleAssociation.userForeignKey,
    timestamps: true,
  });
};
