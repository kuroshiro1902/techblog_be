import { analyzeCommentSentiment } from "./service-helpers/analyzeCommentSentiment";
import { categorizePost } from "./service-helpers/categorizePost";
import { createEmbedding, createEmbeddingBatch } from "./service-helpers/createEmbedding";
import { summaryContent } from "./service-helpers/summaryContent";

export const OpenAIService = {
  summaryContent,
  analyzeCommentSentiment,
  createEmbeddingBatch,
  createEmbedding,
  categorizePost
}