import OpenAI from "openai";
import type {
  ChatCompletionTool,
  ChatCompletionToolChoiceOption,
} from "openai/resources/chat/completions";
import { BaseChatModel } from "./baseChatModel.js";
import { encoding_for_model, TiktokenModel } from "tiktoken";
import { resolve } from "path";
import { PsAiModelSize, PsAiModelType } from "../aiModelTypes.js";
import { PsAiModel } from "../dbModels/aiModel.js";

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
    super(config, modelName, maxTokensOut);
    if (process.env.PS_AGENT_OPENAI_API_KEY) {
      apiKey = process.env.PS_AGENT_OPENAI_API_KEY;
      this.logger.debug(
        "Using OpenAI API key from PS_AGENT_OPENAI_API_KEY environment variable"
      );
    }

    this.client = new OpenAI({ apiKey });
    this.modelConfig = config;
  }

  async generate(
    messages: PsModelMessage[],
    streaming?: boolean,
    streamingCallback?: Function,
    media?: { mimeType: string; data: string }[],
    tools?: ChatCompletionTool[],
    toolChoice: ChatCompletionToolChoiceOption | "auto" = "auto",
    allowedTools?: string[]
  ): Promise<PsBaseModelReturnParameters | undefined> {
    // 1. Convert messages to OpenAI format
    let formattedMessages = messages.map((msg) => {
      const base: any = {
        role: msg.role as "system" | "developer" | "user" | "assistant",
        content: msg.message,
      };
      if (msg.name) {
        base.name = msg.name;
      }
      if (msg.toolCall) {
        base.tool_calls = [
          {
            type: "function",
            function: {
              name: msg.toolCall.name,
              arguments: JSON.stringify(msg.toolCall.arguments ?? {}),
            },
          },
        ];
      }
      return base;
    });

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
    } else if (
      this.modelConfig.modelSize === PsAiModelSize.Small &&
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

    const encoding = encoding_for_model(this.modelName as TiktokenModel);
    let logitBias: Record<number, number> | undefined;
    if (allowedTools && allowedTools.length && tools?.length) {
      logitBias = {};
      for (const t of tools) {
        const name = t.type === "function" ? t.function.name : "";
        if (!allowedTools.includes(name)) {
          encoding.encode(name).forEach((tok) => {
            logitBias![tok] = -100;
          });
        }
      }
      this.logger.debug(
        `Allowed tools: ${JSON.stringify(
          allowedTools
        )} logit_bias: ${JSON.stringify(logitBias)}`
      );
    }
    encoding.free();

    // 3. Streaming vs. Non-streaming
    if (streaming) {
      const stream = await this.client.chat.completions.create({
        model: this.modelName,
        messages: formattedMessages,
        stream: true,
        tools,
        tool_choice: toolChoice,
        logit_bias: logitBias,
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
        stream_options: { include_usage: true },
      });

      let aggregated = "";
      const toolCallsAccum: Record<
        number,
        { name?: string; args: string }
      > = {};
      let tokensIn = 0;
      let tokensOut = 0;
      let cachedInTokens = 0;
      let reasoningTokens = 0;
      let audioTokens = 0;

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;

        if (delta?.content) {
          aggregated += delta.content;
          if (streamingCallback) {
            streamingCallback(delta.content);
          }
        }

        if (delta?.tool_calls) {
          for (const call of delta.tool_calls) {
            const idx = call.index ?? 0;
            const existing = toolCallsAccum[idx] || { args: "" };
            if (call.function?.name) {
              existing.name = call.function.name;
            }
            if (call.function?.arguments) {
              existing.args += call.function.arguments;
            }
            toolCallsAccum[idx] = existing;
          }
        }

        if (chunk.usage) {
          tokensIn = chunk.usage.prompt_tokens;
          tokensOut = chunk.usage.completion_tokens;
          cachedInTokens =
            chunk.usage.prompt_tokens_details?.cached_tokens || 0;
          reasoningTokens =
            chunk.usage.completion_tokens_details?.reasoning_tokens || 0;
          audioTokens =
            chunk.usage.completion_tokens_details?.audio_tokens || 0;
        }
      }

      const toolCalls: { name: string; arguments: any }[] = [];
      for (const idx of Object.keys(toolCallsAccum)) {
        const { name, args } = toolCallsAccum[Number(idx)];
        if (name) {
          try {
            toolCalls.push({ name, arguments: JSON.parse(args || "{}") });
          } catch (err) {
            this.logger.warn(`Failed to parse tool call arguments: ${err}`);
            toolCalls.push({ name, arguments: {} });
          }
        }
      }

      return {
        tokensIn,
        tokensOut,
        cachedInTokens,
        content: aggregated,
        reasoningTokens,
        audioTokens,
        toolCalls,
      };
    } else {
      if (process.env.PS_DEBUG_PROMPT_MESSAGES) {
        this.logger.debug(
          `Messages:\n${this.prettyPrintPromptMessages(formattedMessages)}`
        );
      }
      const timeNow = new Date();
      this.logger.info(`Calling OpenAI model... ${timeNow.toISOString()}`);
      const response = await this.client.chat.completions.create({
        model: this.modelName,
        messages: formattedMessages,
        tools,
        tool_choice: toolChoice,
        logit_bias: logitBias,
        reasoning_effort:
          this.modelConfig.modelType === PsAiModelType.TextReasoning &&
          !this.modelName.toLowerCase().includes("o1 mini")
            ? this.modelConfig.reasoningEffort
            : undefined,
        temperature:
          this.modelConfig.modelType === PsAiModelType.TextReasoning
            ? undefined
            : this.modelConfig.temperature,
        max_completion_tokens:
          this.modelConfig.modelType === PsAiModelType.TextReasoning
            ? undefined
            : this.modelConfig.maxTokensOut,
      });

      const timeNow2 = new Date();
      this.logger.info(
        `OpenAI model call completed in ${
          (timeNow2.getTime() - timeNow.getTime()) / 1000
        } seconds`
      );

      const content = response.choices[0]?.message?.content;
      if (!content) {
        this.logger.error("No content returned from OpenAI");
        this.logger.error(JSON.stringify(response, null, 2));
      }
      const toolCalls: { name: string; arguments: any }[] = [];
      const tcList = response.choices[0]?.message?.tool_calls;
      if (tcList && tcList.length) {
        for (const tc of tcList) {
          if (tc.type === "function") {
            try {
              toolCalls.push({
                name: tc.function.name,
                arguments: JSON.parse(tc.function.arguments || "{}"),
              });
            } catch (err) {
              this.logger.warn(`Failed to parse tool call arguments: ${err}`);
              toolCalls.push({ name: tc.function.name, arguments: {} });
            }
          }
        }
      }
      const tokensIn = response.usage!.prompt_tokens;
      const tokensOut = response.usage!.completion_tokens;
      const cachedInTokens =
        response.usage!.prompt_tokens_details?.cached_tokens || 0;

      const reasoningTokens =
        response.usage!.completion_tokens_details?.reasoning_tokens || 0;
      const audioTokens =
        response.usage!.completion_tokens_details?.audio_tokens || 0;

      const completion_tokens_details =
        response.usage!.completion_tokens_details;

      this.logger.debug(
        JSON.stringify(
          {
            tokensIn,
            cachedInTokens,
            tokensOut,
            content,
            completion_tokens_details,
            reasoningTokens,
            audioTokens,
          },
          null,
          2
        )
      );

      this.logger.debug(
        `OpenAI Tool calls: ${JSON.stringify(toolCalls, null, 2)}`
      );

      return {
        tokensIn,
        tokensOut,
        cachedInTokens,
        content: content ?? "",
        reasoningTokens,
        audioTokens,
        toolCalls,
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
