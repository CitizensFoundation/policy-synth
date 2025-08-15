import { EventEmitter } from "events";
import type { PsAiModelSize, PsAiModelType } from "../aiModelTypes.js";

export const policySynthEvents = new EventEmitter();

export type TokenUsageEvent = {
  modelName: string;
  modelProvider: string;
  modelType: PsAiModelType;
  modelSize: PsAiModelSize;
  tokensIn: number;
  tokensOut: number;
  cachedInTokens?: number;
  longContextTokenIn?: number;
  longContextTokenInCached?: number;
  longContextTokenOut?: number;
  agentId?: number;
  userId?: number;
  modelId?: number;
  timestamp: number;
};

export const TOKEN_USAGE_EVENT = "tokenUsage" as const;


