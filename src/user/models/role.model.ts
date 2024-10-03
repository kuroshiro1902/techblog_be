import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { IRole, roleSchema, roleUpdateSchema } from './types/role.type';
import { IUser } from './types/user.type';

const tableName = 'roles';
const modelName = 'role';

@Table({
  tableName,
  modelName,
  timestamps: true,
  underscored: true,
})
class RoleModel extends Model implements IRole {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      len: [roleSchema.shape.name.minLength!, roleSchema.shape.name.maxLength!],
    },
  })
  declare name: string;

  declare users?: IUser[];
}

const roleDto = (role: IRole) => {
  const { id, name } = role;
  return { id, name };
};

export const Role = {
  get schema() {
    return roleSchema;
  },
  get updateSchema() {
    return roleUpdateSchema;
  },
  get model() {
    return RoleModel;
  },
  dto: roleDto,
};
