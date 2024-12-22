import dotenv from 'dotenv';
dotenv.config();
import { env } from 'process';
import { GenerationConfig, GoogleGenerativeAI } from '@google/generative-ai';

const apiToken = env.GEMINI_FLASH_API_TOKEN!;

// 15 RPM (requests per minute)
// 1 million TPM (tokens per minute)
// 1,500 RPD (requests per day)
const textModel = 'gemini-2.0-flash-exp';
// const model = 'embedding-001'
const embeddingModel = 'text-embedding-004'

const GOOGLE_GEN_AI = new GoogleGenerativeAI(apiToken);

// Nếu muốn xác định sắc thái cơ bản của một bài đánh giá sản phẩm, có thể sử dụng temperature = 0.3, top_p = 0.7 và top_k = 10.
// Nếu muốn phân tích sắc thái của một bài thơ, có thể thử nghiệm với temperature = 0.8, top_p = 0.9 và top_k = 50.
export const GEN_AI_CONFIG: GenerationConfig = {
  temperature: 1, // default 1
  topP: 0.95, // default 0.95
  topK: 40, // default 40
  maxOutputTokens: 8192,
  responseMimeType: 'text/plain', // default text/plain
};

const _TEXT_AI = GOOGLE_GEN_AI.getGenerativeModel({ model: textModel });
const _EMBEDDING_AI = GOOGLE_GEN_AI.getGenerativeModel({ model: embeddingModel });

export const TEXT_AI = (input: string, instruction: string) =>
  _TEXT_AI.startChat({
    history: [
      { role: "user", parts: [{ text: instruction }] },
      { role: "user", parts: [{ text: input }] },
    ],
    generationConfig: GEN_AI_CONFIG
  })
    .sendMessage(input)
    .then(res => res.response.text());

export const EMBEDDING_AI = (input: string) =>
  _EMBEDDING_AI.embedContent(input)
    .then(res => res.embedding.values);
