import { initUserModels } from './user/models';

export const initModels = async () => {
  await initUserModels();
};
