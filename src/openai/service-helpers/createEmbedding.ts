import { EMBEDDING_AI } from "../generative";
import { OPENAI_EMBEDDING } from "../openai";

export const createEmbedding = async (text: string) => {
  const embedding = await EMBEDDING_AI(text);
  // const embedding = await OPENAI_EMBEDDING(text);
  return embedding;
};

