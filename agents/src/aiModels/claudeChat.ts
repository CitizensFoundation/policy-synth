import Anthropic from "@anthropic-ai/sdk";
import { BaseChatModel } from "./baseChatModel.js";
import { encoding_for_model, TiktokenModel } from "tiktoken";
import { ContentBlock } from "@anthropic-ai/sdk/resources/messages/messages.js";

export class ClaudeChat extends BaseChatModel {
  private client: Anthropic;
  private maxThinkingTokens?: number;
  private config: PsAiModelConfig;

  constructor(config: PsAiModelConfig) {
    const {
      apiKey,
      modelName = "claude-3-opus-20240229",
      maxTokensOut = 4096,
    } = config;
    super(modelName, maxTokensOut);
    this.maxThinkingTokens = config.maxThinkingTokens;
    this.client = new Anthropic({ apiKey });
    this.config = config;
  }

  async generate(
    messages: PsModelMessage[],
    streaming?: boolean,
    streamingCallback?: Function
  ) {
    this.logger.debug(
      `Model config: type=${this.config.modelType}, size=${this.config.modelSize}, ` +
        `effort=${this.config.reasoningEffort}, maxtemp=${this.config.temperature}, ` +
        `maxTokens=${this.config.maxTokensOut}, maxThinkingTokens=${this.config.maxThinkingTokens}`
    );
    let systemMessage: string | undefined;
    const formattedMessages = messages
      .filter((msg) => {
        if (msg.role === "system") {
          systemMessage = msg.message;
          return false;
        }
        return true;
      })
      .map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.message,
      }));

    if (process.env.PS_DEBUG_PROMPT_MESSAGES) {
      this.logger.debug(
        `Messages:\n${this.prettyPrintPromptMessages(formattedMessages)}`
      );
    }

    const requestOptions: Anthropic.MessageCreateParams = {
      max_tokens: this.maxTokensOut,
      messages: formattedMessages,
      model: this.modelName,
      thinking: this.maxThinkingTokens
        ? {
            type: "enabled",
            budget_tokens: this.maxThinkingTokens!,
          }
        : undefined,
    };

    if (systemMessage) {
      requestOptions.system = [
        {
          type: "text",
          text: systemMessage,
          cache_control: { type: "ephemeral" },
        },
      ] as any[];

      if (process.env.PS_PROMPT_DEBUG) {
        console.debug(
          `--------------> Using system message with cache control: ${JSON.stringify(
            requestOptions.system,
            null,
            2
          )}`
        );
      }
    }

    if (streaming) {
      const stream = await this.client.messages.create({
        ...requestOptions,
        stream: true,
      });

      for await (const messageStreamEvent of stream) {
        if (streamingCallback) {
          streamingCallback(messageStreamEvent);
        }
      }
      return undefined;
      // TODO: Deal with token usage here
    } else {
      let response;
      response = await this.client.messages.create(requestOptions);
      console.debug(`Generated response: ${JSON.stringify(response, null, 2)}`);
      let tokensIn = response.usage.input_tokens;
      let tokensOut = response.usage.output_tokens;

      //TODO: Fix this properly
      if ((response.usage as any).cache_creation_input_tokens) {
        tokensIn += (response.usage as any).cache_creation_input_tokens * 1.25;
      }

      if ((response.usage as any).cache_read_input_tokens) {
        tokensIn += (response.usage as any).cache_read_input_tokens * 0.1;
      }
      return {
        tokensIn: Math.round(tokensIn),
        tokensOut: Math.round(tokensOut),
        content: this.getTextTypeFromContent(response.content),
      };
    }
  }

  getTextTypeFromContent(content: ContentBlock[]): string {
    for (const block of content) {
      if (block.type === "text") {
        return block.text;
      }
    }

    this.logger.warn(
      `Unknown content type: ${JSON.stringify(content, null, 2)}`
    );
    return "unknown";
  }

  async getEstimatedNumTokensFromMessages(
    messages: PsModelMessage[]
  ): Promise<number> {
    //TODO: Get the right encoding
    const encoding = encoding_for_model(
      /*this.modelName*/ "gpt-4o" as TiktokenModel
    );
    const formattedMessages = messages.map((msg) => msg.message).join(" ");
    const tokenCount = encoding.encode(formattedMessages).length;
    return Promise.resolve(tokenCount);
  }
}

export default ClaudeChat;
