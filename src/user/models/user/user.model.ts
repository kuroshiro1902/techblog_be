import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { TUser, TUserCreate, userSchema } from './user.type';
import { TRole } from '../role/role.type';
import { EUserRoleAssociation } from '@/user/constants/associations/user-role.constant';

const tableName = 'users';
const modelName = 'user';

const roleAssociationKey = EUserRoleAssociation.roleAssociationKey;

@Table({
  timestamps: true,
  underscored: true,
  tableName,
  modelName,
})
export class UserModel extends Model<TUser, TUserCreate> implements TUser {
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
      len: [userSchema.shape.name.minLength!, userSchema.shape.name.maxLength!],
    },
  })
  declare name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [userSchema.shape.username.minLength!, userSchema.shape.username.maxLength!],
    },
  })
  declare username: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      len: [userSchema.shape.password.minLength!, userSchema.shape.password.maxLength!],
    },
  })
  declare password: string;

  @Column({
    type: DataType.STRING(1000),
    allowNull: true,
    validate: {
      len: [0, 1000],
    },
  })
  declare description: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    validate: {
      isEmail: true,
    },
  })
  declare email?: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare dob?: number;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
  })
  declare avatarUrl?: string;

  declare [roleAssociationKey]?: TRole[];
}
