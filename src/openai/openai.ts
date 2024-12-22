import { OpenAI as OpenAIClient } from 'openai';
import dotenv from 'dotenv';
import { htmlToText } from 'html-to-text';

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
export const OPENAI_TEXT = (input: string, instruction: string) => OpenAI.chat.completions.create({
  model: "gpt-4o-mini",
  temperature: 0.3,
  messages: [{ role: "system", content: instruction }, { role: "user", content: input }],
}).then(res => res.choices[0].message.content).catch(err => {
  console.log(err);
  return "";
});

export const OPENAI_EMBEDDING = (input: string) => OpenAI.embeddings.create({
  model: /*"text-embedding-3-small"*/ "text-embedding-ada-002",
  dimensions: 768,
  input
}).then(res => res.data[0].embedding).catch(err => {
  console.log(err);
  return [] as number[];
});
