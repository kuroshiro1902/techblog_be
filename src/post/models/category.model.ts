import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import {
  categorySchema,
  categoryUpdateSchema,
  ICategory,
} from './types/category.type';

const tableName = 'categories';
const modelName = 'category';

@Table({
  tableName,
  modelName,
  timestamps: true,
  underscored: true,
})
class CategoryModel extends Model<ICategory, ICategory> implements ICategory {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING(32),
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING(255),
  })
  declare icon: string;

  // Self-referencing foreign key for parent category
  @ForeignKey(() => CategoryModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: true, // Can be null if it's a root category
  })
  declare parentId: number | null;

  // Relation to parent category
  @BelongsTo((models) => models?.CategoryModel, {
    foreignKey: 'parentId',
    as: 'parent',
  })
  declare parentCategory: CategoryModel | null;

  // Relation to child categories
  @HasMany(() => CategoryModel, { foreignKey: 'parentId', as: 'children' })
  declare children: CategoryModel[];
}

const categoryDto = (category: ICategory) => {
  const { id, name, icon, children } = category;
  return { id, name, icon, children };
};

export const Category = {
  get schema() {
    return categorySchema;
  },
  get updateSchema() {
    return categoryUpdateSchema;
  },
  get model() {
    return CategoryModel;
  },
  dto: categoryDto,
};
