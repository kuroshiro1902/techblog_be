import dotenv from 'dotenv/config';
import {
  TEXT_AI as TEXT_AI_OPENAI,
  EMBEDDING_AI as EMBEDDING_AI_OPENAI,
  EMBEDDING_BATCH_AI as EMBEDDING_BATCH_AI_OPENAI
} from './openai';

import { env } from 'process';
import { GenerationConfig, GenerativeAI } from '@/generative';

const apiToken = env.GENERATIVE_API_TOKEN!;

// 15 RPM (requests per minute)
// 1 million TPM (tokens per minute)
// 1,500 RPD (requests per day)
const textModel = process.env.GENERATIVE_TEXT_MODEL!;
// const model = 'embedding-001'
const embeddingModel = 'text-embedding-004'

const GEN_AI = new GenerativeAI(apiToken);

// Nếu muốn xác định sắc thái cơ bản của một bài đánh giá sản phẩm, có thể sử dụng temperature = 0.3, top_p = 0.7 và top_k = 10.
// Nếu muốn phân tích sắc thái của một bài thơ, có thể thử nghiệm với temperature = 0.8, top_p = 0.9 và top_k = 50.
export const GEN_AI_CONFIG: GenerationConfig = {
  temperature: 1, // default 1
  topP: 0.95, // default 0.95
  topK: 40, // default 40
  maxOutputTokens: 8192,
  responseMimeType: 'text/plain', // default text/plain
};

const _TEXT_AI = GEN_AI.getGenerativeModel({ model: textModel });
const _EMBEDDING_AI = GEN_AI.getGenerativeModel({ model: embeddingModel });

export const TEXT_AI = (input: string, instruction: string, config?: GenerationConfig) =>
  _TEXT_AI.startChat({
    history: [
      { role: "user", parts: [{ text: instruction }] },
      { role: "user", parts: [{ text: input }] },
    ],
    generationConfig: { ...GEN_AI_CONFIG, ...config }
  })
    .sendMessage(input)
    .then(res => res.response.text());

export const EMBEDDING_AI = (input: string) =>
  _EMBEDDING_AI.embedContent(input)
    .then(res => res.embedding.values);

export const EMBEDDING_BATCH_AI = (input: string[]) =>
  _EMBEDDING_AI.batchEmbedContents({
    requests: input.map(item => ({ content: { role: 'user', parts: [{ text: item }] } }))
  })
    .then(res => res.embeddings.map(item => item.values));

// export { TEXT_AI_OPENAI as TEXT_AI, EMBEDDING_AI_OPENAI as EMBEDDING_AI, EMBEDDING_BATCH_AI_OPENAI as EMBEDDING_BATCH_AI }