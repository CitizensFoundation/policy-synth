import Anthropic from "@anthropic-ai/sdk";
import {
  ContentBlock,
  Tool,
  ToolChoice,
} from "@anthropic-ai/sdk/resources/messages/messages.js";
import type {
  ChatCompletionTool,
  ChatCompletionFunctionTool,
  ChatCompletionToolChoiceOption,
} from "openai/resources/chat/completions";
import { BaseChatModel } from "./baseChatModel.js";
import { encoding_for_model, TiktokenModel } from "tiktoken";
import { PsAiModel } from "../dbModels/aiModel.js";
export class ClaudeChat extends BaseChatModel {
  private client: Anthropic;
  private maxThinkingTokens?: number;
  config: PsAiModelConfig;

  constructor(config: PsAiModelConfig) {
    const {
      apiKey,
      modelName = "claude-3-opus-20240229",
      maxTokensOut = 4096,
    } = config;
    super(config, modelName, maxTokensOut);
    this.maxThinkingTokens = config.maxThinkingTokens;
    this.client = new Anthropic({ apiKey });
    this.config = config;
  }

  async generate(
    messages: PsModelMessage[],
    streaming?: boolean,
    streamingCallback?: Function,
    media?: { mimeType: string; data: string }[],
    tools?: ChatCompletionFunctionTool[],
    toolChoice: ChatCompletionToolChoiceOption | "auto" = "auto",
    allowedTools?: string[]
  ): Promise<PsBaseModelReturnParameters | undefined> {
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

    if (tools && tools.length) {
      const filteredTools = allowedTools && allowedTools.length
        ? tools.filter((t) => allowedTools.includes(t.function.name))
        : tools;
      if (filteredTools.length) {
        requestOptions.tools = filteredTools.map(
          (t) =>
            ({
              name: t.function.name,
              description: t.function.description,
              input_schema: {
                type: "object",
                ...(t.function.parameters || {}),
              },
            }) as Tool
        );

        const choice: ToolChoice | undefined =
          toolChoice === "auto"
            ? { type: "auto" }
            : toolChoice === "none"
            ? { type: "none" }
            : (toolChoice as any).type === "function"
            ? { type: "tool", name: (toolChoice as any).function.name }
            : undefined;
        if (choice) {
          requestOptions.tool_choice = choice;
        }
      }
    }

    if (systemMessage) {
      requestOptions.system = [
        {
          type: "text",
          text: systemMessage,
          cache_control: { type: "ephemeral" },
        },
      ] as any[];

      if (process.env.PS_PROMPT_DEBUG) {
        this.logger.debug(
          `--------------> Using system message with cache control: ${JSON.stringify(
            requestOptions.system,
            null,
            2
          )}`
        );
      }
    }

    if (streaming) {
      const stream = await this.client.messages.stream({
        ...requestOptions,
      });

      let aggregated = "";
      const toolCalls: ToolCall[] = [];

      for await (const messageStreamEvent of stream) {
        if (streamingCallback) {
          streamingCallback(messageStreamEvent);
        }

        if (messageStreamEvent.type === "content_block_start") {
          if (messageStreamEvent.content_block.type === "text") {
            aggregated += messageStreamEvent.content_block.text;
          } else if (messageStreamEvent.content_block.type === "tool_use") {
            toolCalls.push({
              id: messageStreamEvent.content_block.id ?? "",
              name: messageStreamEvent.content_block.name ?? "unknown",
              arguments:
                (messageStreamEvent.content_block.input as Record<string, unknown>) ??
                ({} as Record<string, unknown>),
            });
          }
        } else if (
          messageStreamEvent.type === "content_block_delta" &&
          messageStreamEvent.delta.type === "text_delta"
        ) {
          aggregated += messageStreamEvent.delta.text;
        }
      }

      const finalMessage = await stream.finalMessage();
      let tokensIn = finalMessage.usage.input_tokens;
      let tokensOut = finalMessage.usage.output_tokens;
      let cachedInTokens = finalMessage.usage.cache_creation_input_tokens;

      if ((finalMessage.usage as any).cache_creation_input_tokens) {
        tokensIn += (finalMessage.usage as any).cache_creation_input_tokens * 1.25;
      }

      if ((finalMessage.usage as any).cache_read_input_tokens) {
        tokensIn += (finalMessage.usage as any).cache_read_input_tokens * 0.1;
      }

      return {
        tokensIn,
        tokensOut,
        cachedInTokens: cachedInTokens ?? 0,
        content: aggregated || this.getTextTypeFromContent(finalMessage.content),
        toolCalls,
      };
    } else {
      let response;
      response = await this.client.messages.create(requestOptions);
      this.logger.debug(`Generated response: ${JSON.stringify(response, null, 2)}`);
      let tokensIn = response.usage.input_tokens;
      let tokensOut = response.usage.output_tokens;
      let cachedInTokens = response.usage.cache_creation_input_tokens;

      //TODO: Fix this properly
      if ((response.usage as any).cache_creation_input_tokens) {
        tokensIn += (response.usage as any).cache_creation_input_tokens * 1.25;
      }

      if ((response.usage as any).cache_read_input_tokens) {
        tokensIn += (response.usage as any).cache_read_input_tokens * 0.1;
      }
      const toolCalls: ToolCall[] = [];
      for (const block of response.content) {
        if (block.type === "tool_use") {
          toolCalls.push({
            id: block.id ?? "",
            name: block.name ?? "unknown",
            arguments:
              (block.input as Record<string, unknown>) ??
              ({} as Record<string, unknown>),
          });
        }
      }
      return {
        tokensIn: tokensIn,
        tokensOut: tokensOut,
        cachedInTokens: cachedInTokens ?? 0,
        content: this.getTextTypeFromContent(response.content),
        toolCalls,
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
