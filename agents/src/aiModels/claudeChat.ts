import Anthropic from "@anthropic-ai/sdk";
import { BaseChatModel } from "./baseChatModel.js";
import { encoding_for_model, TiktokenModel } from "tiktoken";
import {
  ContentBlock,
  TextBlockParam,
} from "@anthropic-ai/sdk/resources/messages.js";

export class ClaudeChat extends BaseChatModel {
  private client: Anthropic;

  constructor(config: PsAiModelConfig) {
    const {
      apiKey,
      modelName = "claude-3-opus-20240229",
      maxTokensOut = 4096,
    } = config;
    super(modelName, maxTokensOut);
    this.client = new Anthropic({ apiKey });
  }

  async generate(
    messages: PsModelMessage[],
    streaming?: boolean,
    streamingCallback?: Function
  ) {
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

    const requestOptions: Anthropic.MessageCreateParams = {
      max_tokens: this.maxTokensOut,
      messages: formattedMessages,
      model: this.modelName,
    };

    if (systemMessage) {
      if (process.env.PS_ANTHROPIC_BETA_CONTEXT_CACHING) {
        requestOptions.system = [
          {
            type: "text",
            text: systemMessage,
            cache_control: {"type": "ephemeral"}
          },
        ] as any[];

        if (process.env.PS_PROMPT_DEBUG) {
          console.debug(`--------------> Using system message: ${JSON.stringify(requestOptions.system, null, 2)}`);
        }
      } else {
        requestOptions.system = [
          {
            type: "text",
            text: systemMessage,
          },
        ] as TextBlockParam[];
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
      if (process.env.PS_ANTHROPIC_BETA_CONTEXT_CACHING) {
        response = await this.client.beta.promptCaching.messages.create(
          requestOptions
        );
      } else {
        response = await this.client.messages.create(requestOptions);
      }
      console.debug(`Generated response: ${JSON.stringify(response, null, 2)}`);
      let tokensIn = response.usage.input_tokens;
      let tokensOut = response.usage.output_tokens;

      //TODO: Fix this properly
      if (process.env.PS_ANTHROPIC_BETA_CONTEXT_CACHING) {
        if ((response.usage as any).cache_creation_input_tokens) {
          tokensIn += (response.usage as any).cache_creation_input_tokens*1.25;
        }

        if ((response.usage as any).cache_read_input_tokens) {
          tokensIn += (response.usage as any).cache_read_input_tokens*0.1;
        }
      }
      return {
        tokensIn: Math.round(tokensIn),
        tokensOut: Math.round(tokensOut),
        content: (response.content[0] as any).text,
      };
    }
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
