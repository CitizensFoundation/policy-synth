import { OpenAI } from "openai";

const config = {
  apiKey: process.env.OPENAI_KEY,
};

export const createEmbedding = async (text: string) => {
  const openai = new OpenAI(config);
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  });

  return {
    embeddings: response.data[0].embedding,
    totalTokens: response.usage.total_tokens
  };
};
