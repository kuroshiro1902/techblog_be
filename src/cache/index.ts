import { initCategoryNameCache } from "./category.cache";

export const initCaches = async () => {
  await initCategoryNameCache();
};