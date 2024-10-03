import { ENVIRONMENT } from '@/common/environments/environment';
import { Sequelize } from 'sequelize-typescript';

const { uri } = ENVIRONMENT.db;
export const DB = new Sequelize(uri, {});
