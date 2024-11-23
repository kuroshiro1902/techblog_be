export type TPost_S = {
  [EPost_S_Field.id]: number;
  [EPost_S_Field.title]: string;
  [EPost_S_Field.slug]: string;
  [EPost_S_Field.content]: string;
  [EPost_S_Field.categories]: {
    id: number, name?: string
  }[];
  [EPost_S_Field.createdAt]: Date;
  // isPublished?: boolean;
  // views?: number;
  // author: { id: number, name: string };
  //   updatedAt: Date
};

export enum EPost_S_Field {
  id = 'id',
  title = 'title',
  slug = 'slug',
  content = 'content',
  categories = 'categories',
  createdAt = 'createdAt',
}
