import { EPostField } from "@/post/validators/post.schema";
import { TRatingInfo } from "@/post/validators/ratingInfo.schema";

export type TPost_S = {
  [EPostField.id]: number;
  [EPostField.title]: string;
  [EPostField.content]: string;
  [EPostField.slug]: string;
  description?: string | null;
  isPublished?: boolean | null;
  [EPostField.views]: number;
  [EPostField.thumbnailUrl]?: string | null;
  author: {
    id: number;
    name: string;
  };
  [EPostField.categories]: {
    id: number;
    name: string;
  }[];
  [EPostField.createdAt]: Date;
  ratings: TRatingInfo;
  embedding?: number[];
};

