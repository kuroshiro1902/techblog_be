import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { z } from 'zod';
import { IUser, userSchema, userUpdateSchema } from './types/user.type';
import { IRole } from './types/role.type';

const tableName = 'users';
const modelName = 'user';

export interface ITokenPayload {
  id: number;
}

@Table({
  timestamps: true,
  underscored: true,
  tableName,
  modelName,
})
export class UserModel extends Model<IUser> implements IUser {
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
      len: [
        userSchema.shape.password.minLength!,
        userSchema.shape.password.maxLength!,
      ],
    },
  })
  declare name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [
        userSchema.shape.username.minLength!,
        userSchema.shape.username.maxLength!,
      ],
    },
  })
  declare username: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      len: [
        userSchema.shape.password.minLength!,
        userSchema.shape.password.maxLength!,
      ],
    },
  })
  declare password: string;

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

  declare roles?: IRole[];
}

export interface IUserDto {
  id: number;
  name: string;
  email: string | undefined;
  dob: number | undefined;
  avatarUrl: string | undefined;
  roles:
    | {
        name: string;
      }[]
    | undefined;
}

const userDto = (user: IUser): IUserDto => {
  const { id, name, email, dob, avatarUrl, roles } = user;
  return {
    id,
    name,
    email,
    dob,
    avatarUrl,
    roles: roles?.map((r) => ({ name: r.name })),
  };
};

export const User = {
  get schema() {
    return userSchema;
  },
  get updateSchema() {
    return userUpdateSchema;
  },
  get model() {
    return UserModel;
  },
  dto: userDto,
};
