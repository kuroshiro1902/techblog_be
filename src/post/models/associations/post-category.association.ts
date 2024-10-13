export const postCategoryAssociation = {
  tableName: 'user_role',
  userForeignKey: 'user_id',
  roleForeignKey: 'role_id',
  roleAssociationKey: 'roles',
  usersAssociationKey: 'user',
};

// USER-ROLE ASSOCIATION - M:N
export const createPostCategoryAssociation = () => {
  Post.model.belongsToMany(Role.model, {
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
