import { DB } from '@/database/database';
import { DataTypes } from 'sequelize';

export const RefreshToken = DB.define(
  'RefreshToken',
  {
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    updatedAt: true,
    underscored: true,
  }
);
