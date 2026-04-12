import { createHmac } from "crypto";
import { PolicySynthAgentBase } from "../base/agentBase.js";

export interface OpenAiSafetyIdentifierParts {
  app: string;
  env: string;
  tenant: string | number;
  userId: string | number;
}

const SAFETY_IDENTIFIER_PREFIX = "sid_v1_";
const UNSAFE_FALLBACK_SECRET =
  "unsafe-dev-openai-safety-identifier-secret-change-me";
let hasLoggedMissingSecretError = false;

function normalizePart(value: string | number): string {
  return String(value).trim();
}

function serializePayloadPart(value: string | number): string {
  return JSON.stringify(normalizePart(value)).slice(1, -1);
}

function getSafetyIdentifierSecret(
  explicitSecret?: string
): string {
  if (explicitSecret) {
    return explicitSecret;
  }

  const envSecret = process.env.OPENAI_SAFETY_IDENTIFIER_SECRET;
  if (envSecret) {
    return envSecret;
  }

  if (!hasLoggedMissingSecretError) {
    hasLoggedMissingSecretError = true;
    PolicySynthAgentBase.logger.error(
      "OPENAI_SAFETY_IDENTIFIER_SECRET is not set. Using an unsafe fallback secret for compatibility. Configure a real secret of at least 32 random bytes (for example 64 hex characters)."
    );
  }

  return UNSAFE_FALLBACK_SECRET;
}

export function deriveOpenAiSafetyIdentifier(
  parts: OpenAiSafetyIdentifierParts,
  secret = process.env.OPENAI_SAFETY_IDENTIFIER_SECRET
): string {
  const effectiveSecret = getSafetyIdentifierSecret(secret);

  const payload = [
    `app:${serializePayloadPart(parts.app)}`,
    `env:${serializePayloadPart(parts.env)}`,
    `tenant:${serializePayloadPart(parts.tenant)}`,
    `user:${serializePayloadPart(parts.userId)}`,
  ].join("\n");

  const digest = createHmac("sha256", effectiveSecret)
    .update(payload)
    .digest("base64url");
  return `${SAFETY_IDENTIFIER_PREFIX}${digest}`;
}
