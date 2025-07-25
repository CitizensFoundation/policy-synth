import { AzureOpenAI } from "openai";
import { DefaultAzureCredential, getBearerTokenProvider } from "@azure/identity";
import { BaseChatModel } from "./baseChatModel.js";
import { encoding_for_model, TiktokenModel } from "tiktoken";
import { PsAiModel } from "../dbModels/aiModel.js";

interface PsModelMessage {
  role: "system" | "developer" | "user" | "assistant" | "tool";
  message: string;
  name?: string;
  toolCall?: ToolCall;
  toolCallId?: string;
}

export class AzureOpenAiChat extends BaseChatModel {
  private client: AzureOpenAI;
  private deploymentName: string;
  private reasoningEffort: 'low' | 'medium' | 'high' = 'medium';
  private temperature: number = 0.7;

  constructor(config: PsAzureAiModelConfig) {
    super(config, config.modelName || "gpt-4", config.maxTokensOut || 4096);

    const scope = "https://cognitiveservices.azure.com/.default";
    const credential = new DefaultAzureCredential();
    const azureADTokenProvider = getBearerTokenProvider(credential, scope);

    this.client = new AzureOpenAI({
      azureADTokenProvider,
      deployment: config.deploymentName,
      apiVersion: "2024-10-21"
    });
    this.deploymentName = config.deploymentName;
    this.reasoningEffort = config.reasoningEffort || 'medium';
    this.temperature = config.temperature || 0.7;
  }

  async generate(
    messages: PsModelMessage[],
    streaming?: boolean,
    streamingCallback?: (chunk: string) => void,
    media?: { mimeType: string; data: string }[]
  ) {
    const chatMessages = messages.map((msg) => {
      if (msg.role === "tool") {
        return {
          role: "tool",
          content: msg.message,
          tool_call_id: msg.toolCallId,
        } as any;
      }

      const base: any = { role: msg.role, content: msg.message };
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

    if (streaming) {
      // Streaming scenario
      const events = await this.client.chat.completions.create({
        messages: chatMessages,
        max_tokens: this.maxTokensOut,
        stream: true,
        model: "", // Model is required, use "" for Azure deployments
        reasoning_effort: this.reasoningEffort,
        temperature: this.temperature
      });

      for await (const event of events) {
        for (const choice of event.choices) {
          const delta = choice.delta?.content;
          if (delta != null && streamingCallback) {
            streamingCallback(delta);
          }
        }
      }

    } else {
      // Non-streaming scenario
      const result = await this.client.chat.completions.create({
        messages: chatMessages,
        max_tokens: this.maxTokensOut,
        model: "", // Model is required, use "" for Azure deployments
        reasoning_effort: this.reasoningEffort,
        temperature: this.temperature
      });

      const content = result.choices.map((choice) => choice.message?.content ?? "").join("");
      const usage = result.usage;
      return {
        tokensIn: usage?.prompt_tokens ?? 0,
        tokensOut: usage?.completion_tokens ?? 0,
        content,
      };
    }
  }

  async getEstimatedNumTokensFromMessages(messages: PsModelMessage[]): Promise<number> {
    const encoder = encoding_for_model(this.modelName as TiktokenModel);
    const tokenCounts = messages.map((msg) => encoder.encode(msg.message).length);
    return tokenCounts.reduce((acc, count) => acc + count, 0);
  }
}
