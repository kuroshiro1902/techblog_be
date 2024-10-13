export enum EUserRoleAssociation {
  tableName = 'user_role',
  userForeignKey = 'user_id',
  roleForeignKey = 'role_id',
  roleAssociationKey = 'roles',
  usersAssociationKey = 'users',
}
