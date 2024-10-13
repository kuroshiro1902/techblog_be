import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { TRole, TRoleCreate, roleSchema } from './role.type';
import { TUser } from '../user/user.type';
import { EUserRoleAssociation } from '@/user/constants/associations/user-role.constant';

const tableName = 'roles';
const modelName = 'role';
const usersAssociationKey = EUserRoleAssociation.usersAssociationKey;

@Table({
  tableName,
  modelName,
  timestamps: true,
  underscored: true,
})
export class RoleModel extends Model<TRole, TRoleCreate> implements TRole {
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

  declare [usersAssociationKey]?: TUser[];
}
