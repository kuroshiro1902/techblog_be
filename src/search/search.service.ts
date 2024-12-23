import { findSimilarPosts } from "./services-helpers/findSimilarPosts";
import { getRecommendedPosts } from "./services-helpers/getRecommendedPosts";
import { updatePostEmbeddings } from "./services-helpers/updatePostEmbeddings";

export const SearchService = {
  findSimilarPosts,
  updatePostEmbeddings,
  getRecommendedPosts
} 