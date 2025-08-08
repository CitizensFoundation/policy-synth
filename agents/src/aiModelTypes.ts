export enum PsAiModelType {
  Embedding = "embedding",
  Text = "text",
  MultiModal = "multiModal",
  Audio = "audio",
  Video = "video",
  Image = "image",
  TextReasoning = "reasoning",
  MultiModalReasoning = "multiModalReasoning",
}

export enum PsAiModelSize {
  Large = "large",
  Medium = "medium",
  Small = "small"
}

export enum PsAiModelProvider {
  OpenAI = "openai",
  OpenAIResponses = "openaiResponses",
  Anthropic = "anthropic",
  Google = "google",
  Azure = "azure",
}