import OpenAI from 'openai';

export const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || 'not-configured',
  baseURL: 'https://openrouter.ai/api/v1',
});

export const MODEL = 'deepseek/deepseek-chat';
