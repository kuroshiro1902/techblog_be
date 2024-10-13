import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { IPost, postSchema, postUpdateSchema } from './types/post.type';
import { TUser } from '@/user/models/user.type';
import { ICategory } from './types/category.type';

const tableName = 'posts';
const modelName = 'post';

@Table({
  timestamps: true,
  underscored: true,
  tableName,
  modelName,
})
export class PostModel extends Model<IPost> implements IPost {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare thumbnailUrl?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare content: string;

  declare author: TUser;

  declare categories?: ICategory[];
}

export interface IPostDto extends IPost {}

const postDto = (post: IPost): IPostDto => {
  const { id, name, author, content, categories, thumbnailUrl, created_at, updated_at } = post;
  return {
    id,
    name,
    author,
    content,
    categories,
    thumbnailUrl,
    created_at,
    updated_at,
  };
};

export const Post = {
  get schema() {
    return postSchema;
  },
  get updateSchema() {
    return postUpdateSchema;
  },
  get model() {
    return PostModel;
  },
  dto: postDto,
};
