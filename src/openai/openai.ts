import { OpenAI as OpenAIClient } from 'openai';
import dotenv from 'dotenv';
import { delay } from '@/common/utils/delay';

dotenv.config();

export const OpenAI = new OpenAIClient({
  apiKey: process.env.OPEN_API_KEY,
  organization: process.env.OPEN_API_ORGANIZATION_ID,
  project: process.env.OPEN_API_PROJECT_ID,
});

/**
 * 
 * @param input 
 * @param instruction Bạn là một ...
 * @returns 
 */
export const TEXT_AI = (input: string, instruction: string, config?: { temperature?: number, topP?: number, topK?: number }) => OpenAI.chat.completions.create({
  model: "gpt-4o-mini",
  temperature: config?.temperature ?? 0.3,
  messages: [{ role: "system", content: instruction }, { role: "user", content: input }],
}).then(res => res.choices[0].message.content ?? '');

export const EMBEDDING_AI = (input: string) => OpenAI.embeddings.create({
  // model: "text-embedding-ada-002", // cheaper
  model: "text-embedding-3-small", // stronger
  dimensions: 768,
  input
}).then(res => res.data[0].embedding);

export const EMBEDDING_BATCH_AI = async (input: string[]) => {
  const embeddings: number[][] = [];
  for (const item of input) {
    embeddings.push(await EMBEDDING_AI(item));
    await delay(500);
  }
  return embeddings;
}