import dotenv from 'dotenv/config';
import {
  TEXT_AI as TEXT_AI_OPENAI,
  EMBEDDING_AI as EMBEDDING_AI_OPENAI,
  EMBEDDING_BATCH_AI as EMBEDDING_BATCH_AI_OPENAI,
} from './openai';

import { env } from 'process';
import { GenerationConfig, GenerativeAI } from '@/config';

const apiTokens = [
  env.GENERATIVE_API_TOKEN1!,
  env.GENERATIVE_API_TOKEN2!,
  env.GENERATIVE_API_TOKEN3!,
].filter(Boolean);

if (apiTokens.length === 0) {
  throw new Error('No API tokens provided!');
}

// Tạo sẵn các instance
const generativeAIInstances = apiTokens.map((token) => new GenerativeAI(token));
let currentTokenIndex = 0;

function getNextInstance() {
  const instance = generativeAIInstances[currentTokenIndex];
  console.log('AI instant index:', currentTokenIndex);
  currentTokenIndex = (currentTokenIndex + 1) % generativeAIInstances.length;
  return instance;
}

// 15 RPM (requests per minute)
// 1 million TPM (tokens per minute)
// 1,500 RPD (requests per day)
const textModel = env.GENERATIVE_TEXT_MODEL!;
const embeddingModel = 'text-embedding-004';

const GEN_AI_CONFIG: GenerationConfig = {
  temperature: 1, // default 1
  topP: 0.95, // default 0.95
  topK: 40, // default 40
  maxOutputTokens: 8192,
  responseMimeType: 'text/plain', // default text/plain
};

async function executeWithRetry<T>(
  operation: (instance: GenerativeAI) => Promise<T>,
  maxRetries: number = generativeAIInstances.length
) {
  let attempts = 0;
  while (attempts < maxRetries) {
    const instance = getNextInstance();
    try {
      return await operation(instance);
    } catch (error) {
      console.error(`Error with token #${currentTokenIndex}. Retrying...`, error);
      attempts++;
      if (attempts >= maxRetries) throw new Error('All API tokens have failed.');
    }
  }
}

export const TEXT_AI = (input: string, instruction: string, config?: GenerationConfig) =>
  executeWithRetry(async (instance) => {
    const _TEXT_AI = instance.getGenerativeModel({ model: textModel });
    return _TEXT_AI
      .startChat({
        history: [
          { role: 'user', parts: [{ text: instruction }] },
          { role: 'user', parts: [{ text: input }] },
        ],
        generationConfig: { ...GEN_AI_CONFIG, ...config },
      })
      .sendMessage(input)
      .then((res) => res.response.text());
  });

export const EMBEDDING_AI = (input: string) =>
  executeWithRetry(async (instance) => {
    const _EMBEDDING_AI = instance.getGenerativeModel({ model: embeddingModel });
    return _EMBEDDING_AI.embedContent(input).then((res) => res.embedding.values);
  });

export const EMBEDDING_BATCH_AI = (input: string[]) =>
  executeWithRetry(async (instance) => {
    const _EMBEDDING_AI = instance.getGenerativeModel({ model: embeddingModel });
    return _EMBEDDING_AI
      .batchEmbedContents({
        requests: input.map((item) => ({ content: { role: 'user', parts: [{ text: item }] } })),
      })
      .then((res) => res.embeddings.map((item) => item.values));
  });

// export { TEXT_AI_OPENAI as TEXT_AI, EMBEDDING_AI_OPENAI as EMBEDDING_AI, EMBEDDING_BATCH_AI_OPENAI as EMBEDDING_BATCH_AI };
