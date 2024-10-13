import { modelInitiateResolver as userModelInitiateResolver } from './user/models';

export const initModels = async () => {
  await userModelInitiateResolver();
};
