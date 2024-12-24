import { EMBEDDING_AI, EMBEDDING_BATCH_AI } from "../generative";

export const createEmbedding = async (text: string) => {
  const embedding = await EMBEDDING_AI(text);
  return embedding;
};

export const createEmbeddingBatch = async (texts: string[]) => {
  const embedding = await EMBEDDING_BATCH_AI(texts);
  return embedding;
};
