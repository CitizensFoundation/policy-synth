import { PsAiModelProvider } from "../aiModelTypes.js";

// Meta Model API (Muse Spark) exposes an OpenAI-compatible Responses surface:
// https://dev.meta.ai/docs/quickstart
export const META_MODEL_API_DEFAULT_BASE_URL = "https://api.meta.ai/v1";
export const META_MODEL_API_DEFAULT_MODEL_NAME = "muse-spark-1.2";
export const META_MODEL_API_MISSING_KEY_PLACEHOLDER =
  "missing-meta-model-api-key";

export class MetaModelApiConfigurationError extends Error {
  readonly isPsNonRetryableModelError = true;

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "MetaModelApiConfigurationError";
  }
}

export const isMetaModelApiProvider = (provider?: string): boolean =>
  (provider ?? "").toLowerCase() === PsAiModelProvider.Meta;

export interface MetaModelApiEnvCredentials {
  apiKey: string;
  credentialRef: string;
  usesGenericModelApiKey: boolean;
}

/**
 * Single source of truth for the Meta Model API env credential lookup so the
 * model transport and the model manager cannot drift apart.
 * META_MODEL_API_KEY is preferred; MODEL_API_KEY is Meta's documented name
 * but generic enough that callers should surface its use.
 */
export const getMetaModelApiEnvCredentials = ():
  | MetaModelApiEnvCredentials
  | undefined => {
  if (process.env.META_MODEL_API_KEY) {
    return {
      apiKey: process.env.META_MODEL_API_KEY,
      credentialRef: "env:META_MODEL_API_KEY",
      usesGenericModelApiKey: false,
    };
  }

  if (process.env.MODEL_API_KEY) {
    return {
      apiKey: process.env.MODEL_API_KEY,
      credentialRef: "env:MODEL_API_KEY",
      usesGenericModelApiKey: true,
    };
  }

  return undefined;
};

export const getMetaModelApiBaseUrl = (): string =>
  process.env.META_MODEL_API_BASE_URL || META_MODEL_API_DEFAULT_BASE_URL;

/**
 * Meta serves only Muse-family models; an obviously-OpenAI model name
 * reaching api.meta.ai means the configuration borrowed another provider's
 * model (e.g. a provider-only ephemeral override reusing the fallback
 * model's name).
 */
export const isForeignModelNameForMetaModelApi = (
  modelName: string
): boolean => /^(gpt-|o[0-9]|chatgpt-|text-|dall-e|whisper)/i.test(
  modelName.trim()
);
