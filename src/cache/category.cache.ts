import { DB } from "@/database/database";

export const categoryNameCache = new Set<string>();

export const initCategoryNameCache = async () => {
  const dbCategories = await DB.category.findMany({ select: { name: true } });
  dbCategories.forEach((category) => categoryNameCache.add(category.name));
};