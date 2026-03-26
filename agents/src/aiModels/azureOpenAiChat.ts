import { AzureOpenAI } from "openai";
import { DefaultAzureCredential, getBearerTokenProvider } from "@azure/identity";
import { BaseChatModel } from "./baseChatModel.js";
import { encoding_for_model, TiktokenModel } from "tiktoken";
import { PsAiModel } from "../dbModels/aiModel.js";

interface PsModelMessage {
  role: "system" | "developer" | "user" | "assistant" | "tool";
  message: string;
  name?: string;
  phase?: PsAssistantMessagePhase;
  toolCall?: ToolCall;
  toolCallId?: string;
}

type UsageItemPayload = PsModelUsageItemProviderData & Record<string, unknown>;
type UsageItemResult = PsBaseModelReturnParameters & {
  usageItemData?: UsageItemPayload;
};

export class AzureOpenAiChat extends BaseChatModel {
  private client: AzureOpenAI;
  private deploymentName: string;
  private reasoningEffort: PsReasoningEffort = 'medium';
  private temperature: number = 0.7;
  private readonly apiVersion = "2024-10-21";

  constructor(config: PsAzureAiModelConfig) {
    super(config, config.modelName || "gpt-4", config.maxTokensOut || 4096);

    const scope = "https://cognitiveservices.azure.com/.default";
    const credential = new DefaultAzureCredential();
    const azureADTokenProvider = getBearerTokenProvider(credential, scope);

    this.client = new AzureOpenAI({
      azureADTokenProvider,
      deployment: config.deploymentName,
      apiVersion: this.apiVersion
    });
    this.deploymentName = config.deploymentName;
    this.reasoningEffort = config.reasoningEffort || 'medium';
    this.temperature = config.temperature || 0.7;
  }

  private buildUsageItemData(
    response: {
      id?: string | null;
      service_tier?: string | null;
      usage?: Record<string, unknown> | null;
    },
    request: {
      stream: boolean;
    },
    usage: {
      tokensIn: number;
      tokensOut: number;
      cachedInTokens: number;
      reasoningTokens: number;
      audioTokens: number;
    }
  ): UsageItemPayload {
    return {
      provider: "azure",
      apiFamily: "chat.completions",
      transport: "azure-openai",
      modelName: this.modelName,
      request: {
        stream: request.stream,
        deploymentName: this.deploymentName,
        apiVersion: this.apiVersion,
        reasoningEffort: this.reasoningEffort ?? null,
        temperature: this.temperature,
        maxTokensOut: this.maxTokensOut ?? null,
      },
      usageRaw: response.usage ?? undefined,
      usageNormalized: {
        tokensIn: usage.tokensIn,
        tokensOut: usage.tokensOut,
        cachedInTokens: usage.cachedInTokens,
        reasoningTokens: usage.reasoningTokens,
        audioTokens: usage.audioTokens,
      },
      providerMetadata: {
        transport: "azure-openai",
        deploymentName: this.deploymentName,
        apiVersion: this.apiVersion,
        responseId: response.id ?? null,
        appliedServiceTier: response.service_tier ?? null,
      },
    };
  }

  async generate(
    messages: PsModelMessage[],
    streaming?: boolean,
    streamingCallback?: (chunk: string) => void,
    media?: { mimeType: string; data: string }[]
  ) {
    const chatMessages = messages
      .filter(
        (msg) => !(msg.role === "assistant" && msg.phase === "commentary")
      )
      .map((msg) => {
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
        reasoning_effort: this.reasoningEffort === 'max' ? 'xhigh' : this.reasoningEffort,
        temperature: this.temperature,
        stream_options: { include_usage: true },
      });

      let content = "";
      let usageRaw: Record<string, unknown> | null = null;
      let responseId: string | null = null;
      let appliedServiceTier: string | null = null;

      for await (const event of events as AsyncIterable<any>) {
        responseId = event?.id ?? responseId;
        appliedServiceTier = event?.service_tier ?? appliedServiceTier;
        usageRaw = (event?.usage as Record<string, unknown> | undefined) ?? usageRaw;

        for (const choice of event.choices ?? []) {
          const delta = choice.delta?.content;
          if (delta != null && streamingCallback) {
            streamingCallback(delta);
          }
          if (delta != null) {
            content += delta;
          }
        }
      }
      const tokensIn = (usageRaw?.prompt_tokens as number | undefined) ?? 0;
      const tokensOut =
        (usageRaw?.completion_tokens as number | undefined) ?? 0;
      const cachedInTokens =
        (
          usageRaw?.prompt_tokens_details as
            | { cached_tokens?: number }
            | undefined
        )?.cached_tokens ?? 0;
      const reasoningTokens =
        (
          usageRaw?.completion_tokens_details as
            | { reasoning_tokens?: number }
            | undefined
        )?.reasoning_tokens ?? 0;
      const audioTokens =
        (
          usageRaw?.completion_tokens_details as
            | { audio_tokens?: number }
            | undefined
        )?.audio_tokens ?? 0;

      const result: UsageItemResult = {
        content,
        tokensIn,
        tokensOut,
        cachedInTokens,
        reasoningTokens,
        audioTokens,
        usageItemData: this.buildUsageItemData(
          {
            id: responseId,
            service_tier: appliedServiceTier,
            usage: usageRaw,
          },
          { stream: true },
          {
            tokensIn,
            tokensOut,
            cachedInTokens,
            reasoningTokens,
            audioTokens,
          }
        ),
      };

      return result;
    } else {
      // Non-streaming scenario
      const result = await this.client.chat.completions.create({
        messages: chatMessages,
        max_tokens: this.maxTokensOut,
        model: "", // Model is required, use "" for Azure deployments
        reasoning_effort: this.reasoningEffort === 'max' ? 'xhigh' : this.reasoningEffort,
        temperature: this.temperature
      });

      const content = result.choices.map((choice) => choice.message?.content ?? "").join("");
      const usage = result.usage;
      const usageItemData = this.buildUsageItemData(
        {
          id: result.id ?? null,
          service_tier: (result as { service_tier?: string | null }).service_tier,
          usage: (usage ?? null) as Record<string, unknown> | null,
        },
        { stream: false },
        {
          tokensIn: usage?.prompt_tokens ?? 0,
          tokensOut: usage?.completion_tokens ?? 0,
          cachedInTokens: usage?.prompt_tokens_details?.cached_tokens ?? 0,
          reasoningTokens:
            usage?.completion_tokens_details?.reasoning_tokens ?? 0,
          audioTokens: usage?.completion_tokens_details?.audio_tokens ?? 0,
        }
      );

      const response: UsageItemResult = {
        tokensIn: usage?.prompt_tokens ?? 0,
        tokensOut: usage?.completion_tokens ?? 0,
        cachedInTokens: usage?.prompt_tokens_details?.cached_tokens ?? 0,
        reasoningTokens: usage?.completion_tokens_details?.reasoning_tokens ?? 0,
        audioTokens: usage?.completion_tokens_details?.audio_tokens ?? 0,
        content,
        usageItemData,
      };

      return response;
    }
  }

  async getEstimatedNumTokensFromMessages(messages: PsModelMessage[]): Promise<number> {
    const encoder = encoding_for_model(this.modelName as TiktokenModel);
    const tokenCounts = messages.map((msg) => encoder.encode(msg.message).length);
    return tokenCounts.reduce((acc, count) => acc + count, 0);
  }
}
