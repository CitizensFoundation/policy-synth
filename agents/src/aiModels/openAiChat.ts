import OpenAI from "openai";
import { BaseChatModel } from "./baseChatModel.js";
import { encoding_for_model, TiktokenModel } from "tiktoken";
import { resolve } from "path";
import { PsAiModelSize, PsAiModelType } from "../aiModelTypes.js";

export class OpenAiChat extends BaseChatModel {
  private client: OpenAI;
  private modelConfig: PsOpenAiModelConfig;

  constructor(config: PsOpenAiModelConfig) {
    let {
      apiKey,
      modelName = "gpt-4o",
      maxTokensOut = 16384,
      temperature = 0.7,
    } = config;
    super(modelName, maxTokensOut);
    if (process.env.PS_AGENT_OPENAI_API_KEY) {
      apiKey = process.env.PS_AGENT_OPENAI_API_KEY;
      this.logger.debug("Using OpenAI API key from PS_AGENT_OPENAI_API_KEY environment variable");
    }

    this.client = new OpenAI({ apiKey });
    this.modelConfig = config;
  }


  async generate(
    messages: PsModelMessage[],
    streaming?: boolean,
    streamingCallback?: Function
  ): Promise<any> {
    // 1. Convert messages to OpenAI format
    let formattedMessages = messages.map((msg) => ({
      role: msg.role as "system" | "developer" | "user" | "assistant",
      content: msg.message,
    }));

    // 2. Collapse system message if the model is "small" reasoning
    if (
      this.modelConfig.modelSize === PsAiModelSize.Small &&
      this.modelName.toLowerCase().includes("o1 mini") &&
      this.modelConfig.modelType === PsAiModelType.TextReasoning &&
      formattedMessages.length > 1 &&
      (formattedMessages[0].role === "system" ||
        formattedMessages[0].role === "developer") &&
      formattedMessages[1].role === "user"
    ) {
      // Prepend system message content to the first user message
      formattedMessages[1].content =
        "<systemMessage>" +
        formattedMessages[0].content +
        "</systemMessage>" +
        formattedMessages[1].content;
      // Remove the system message from the array
      formattedMessages.shift();
    } else if (this.modelConfig.modelSize === PsAiModelSize.Small &&
      this.modelName.toLowerCase().includes("o1 mini") &&
      this.modelConfig.modelType === PsAiModelType.TextReasoning &&
      formattedMessages.length == 1 &&
      formattedMessages[0].role === "system"
    ) {
      // Remove the system message from the array
      formattedMessages[0].role = "user";
    }

    this.logger.debug(
      `Model config: type=${this.modelConfig.modelType}, size=${this.modelConfig.modelSize}, ` +
        `effort=${this.modelConfig.reasoningEffort}, maxtemp=${this.modelConfig.temperature}, ` +
        `maxTokens=${this.modelConfig.maxTokensOut}, maxThinkingTokens=${this.modelConfig.maxThinkingTokens}`
    );

    // 3. Streaming vs. Non-streaming
    if (streaming) {
      const stream = await this.client.chat.completions.create({
        model: this.modelName,
        messages: formattedMessages,
        stream: true,
        reasoning_effort:
          this.modelConfig.modelType === PsAiModelType.TextReasoning
            ? this.modelConfig.reasoningEffort
            : undefined,
        temperature:
          this.modelConfig.modelType === PsAiModelType.TextReasoning
            ? undefined
            : this.modelConfig.temperature,
        max_tokens:
          this.modelConfig.modelType === PsAiModelType.TextReasoning
            ? undefined
            : this.modelConfig.maxTokensOut,
        max_completion_tokens:
          this.modelConfig.modelType === PsAiModelType.TextReasoning
            ? this.modelConfig.maxTokensOut
            : undefined,
      });

      // Emit streaming tokens to the callback
      for await (const chunk of stream) {
        if (streamingCallback) {
          streamingCallback(chunk.choices[0]?.delta?.content ?? "");
        }
      }
    } else {
      if (process.env.PS_DEBUG_PROMPT_MESSAGES) {
        this.logger.debug(`Messages:\n${this.prettyPrintPromptMessages(formattedMessages)}`);
      }
      const timeNow = new Date();
      this.logger.info(`Calling OpenAI model... ${timeNow.toISOString()}`);
      const response = await this.client.chat.completions.create({
        model: this.modelName,
        messages: formattedMessages,
        reasoning_effort:
          this.modelConfig.modelType === PsAiModelType.TextReasoning &&
          !this.modelName.toLowerCase().includes("o1 mini")
            ? this.modelConfig.reasoningEffort
            : undefined,
        temperature:
          this.modelConfig.modelType === PsAiModelType.TextReasoning
            ? undefined
            : this.modelConfig.temperature,
        max_tokens:
          this.modelConfig.modelType === PsAiModelType.TextReasoning
            ? undefined
            : this.modelConfig.maxTokensOut,
        max_completion_tokens:
          this.modelConfig.modelType === PsAiModelType.TextReasoning
            ? this.modelConfig.maxTokensOut
            : undefined,
      });

      const timeNow2 = new Date();
      this.logger.info(`OpenAI model call completed in ${(timeNow2.getTime() - timeNow.getTime())/1000} seconds`);

      const content = response.choices[0]?.message?.content;
      if (!content) {
        this.logger.error("No content returned from OpenAI");
        this.logger.error(JSON.stringify(response, null, 2));
      }
      const tokensIn = response.usage!.prompt_tokens;
      const tokensOut = response.usage!.completion_tokens;
      const cachedTokens =
        response.usage!.prompt_tokens_details?.cached_tokens || 0;

      const completion_tokens_details =
        response.usage!.completion_tokens_details;

      // Adjust the tokensIn to reflect the 50% discount for cached tokens
      const adjustedTokensIn = tokensIn - cachedTokens * 0.5;
      const cacheRatio = (cachedTokens / tokensIn) * 100;

      this.logger.debug(
        JSON.stringify(
          {
            tokensIn,
            cachedTokens,
            cacheRatio,
            tokensOut,
            adjustedTokensIn,
            content,
            completion_tokens_details,
          },
          null,
          2
        )
      );

      return {
        tokensIn: adjustedTokensIn,
        tokensOut,
        cacheRatio,
        content,
      };
    }
  }

  async getEstimatedNumTokensFromMessages(
    messages: PsModelMessage[]
  ): Promise<number> {
    const encoding = encoding_for_model(this.modelName as TiktokenModel);
    const formattedMessages = messages.map((msg) => ({
      role: msg.role as "system" | "user" | "assistant",
      content: msg.message,
    }));

    const tokenCounts = formattedMessages.map(
      (msg) => encoding.encode(msg.content).length
    );
    return tokenCounts.reduce((acc, count) => acc + count, 0);
  }
}

export default OpenAiChat;
