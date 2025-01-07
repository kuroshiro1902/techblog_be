import { findSimilarPosts } from "./services-helpers/findSimilarPosts";
import { getRecommendedPosts } from "./services-helpers/getRecommendedPosts";
import { updatePostEmbeddings } from "./services-helpers/updatePostEmbeddings";
import { suggestRelativeKeywords } from "./suggestRelativeKeywords";

export const SearchService = {
  findSimilarPosts,
  updatePostEmbeddings,
  getRecommendedPosts,
  suggestRelativeKeywords
} 