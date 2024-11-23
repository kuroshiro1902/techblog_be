import { EPostField } from "@/post/validators/post.schema";

export type TPost_S = {
  [EPostField.id]: number;
  [EPostField.title]: string;
  [EPostField.slug]: string;
  [EPostField.content]: string;
  [EPostField.categories]: {
    id: number, name?: string
  }[];
  [EPostField.createdAt]: Date;
  [EPostField.ratings]: number;
  [EPostField.views]: number;
  // isPublished?: boolean;
  // views?: number;
  // author: { id: number, name: string };
  //   updatedAt: Date
};

