# OpenAI Decisions

`PolicySynthAgent`, `PsAiModelManager`, and `PolicySynthSimpleAgentBase` expose
`callDecisions(request, options?)`, returning `Promise<PsDecisionResult>`. The
request and result types derive from the OpenAI SDK. Questions use the SDK's
`predicate`, `choice`, and `score` formats; answers remain in question order and
can include a `refusal` for an individual question.

The default model is `gpt-6-luna`. Model selection follows this order:
`request.model`, `configureDecisions({ modelName })`, `PS_OPENAI_DECISIONS_MODEL`,
then the default. `apiModelName` optionally maps a configured logical model name
to its OpenAI API model ID.

## Simple agent

```typescript
import { PolicySynthSimpleAgentBase } from "@policysynth/agents/base/simpleAgent.js";

// Set OPENAI_API_KEY in the environment.
const agent = new PolicySynthSimpleAgentBase();
const result = await agent.callDecisions({
  input: "Add a bus lane and increase the frequency of buses.",
  questions: [
    {
      type: "predicate",
      name: "transport",
      instructions: "Does the proposal concern public transport?",
    },
    {
      type: "choice",
      name: "topic",
      instructions: "Choose the proposal's main topic.",
      choices: [{ value: "transport" }, { value: "housing" }],
    },
    {
      type: "score",
      name: "specificity",
      instructions: "Rate how specific the proposal is.",
      levels: [
        { label: "vague", description: "No concrete action" },
        { label: "specific", description: "At least one concrete action" },
      ],
    },
  ],
}, { timeoutMs: 30_000, maxRetries: 2 });

for (const answer of result.answers) {
  switch (answer.type) {
    case "predicate": console.log(answer.name, answer.probability); break;
    case "choice": console.log(answer.name, answer.choice, answer.confidence); break;
    case "score": console.log(answer.name, answer.score, answer.confidence); break;
    case "refusal": console.log(answer.name, "refused"); break;
  }
}
```

Choice values preserve their types: boolean `true` and string `"true"` are
distinct. Refusals are returned as data and do not trigger retries.

When the simple agent has memory, usage and costs accumulate in
`memory.stages.decisions` and `memory.totalCost`. Set `options.stage` to select a
different stage. Memory is saved after the request succeeds.

## Database agent

Create and attach an AI model with `type: PsAiModelType.Decision` and provider
`openai` to the agent, with its API key in the group's
`private_access_configuration` under the model's `aiModelId`. Its configuration
can use the dedicated defaults:

```typescript
import { PsAiModelType, PsAiModelSize } from "@policysynth/agents/aiModelTypes.js";
import { getDefaultOpenAiDecisionsPrices } from "@policysynth/agents/aiModels/openAiDecisions.js";

const configuration: PsAiModelConfiguration = {
  type: PsAiModelType.Decision,
  modelSize: PsAiModelSize.Small,
  model: "gpt-6-luna",
  provider: "openai",
  accountingVersion: 2,
  prices: getDefaultOpenAiDecisionsPrices(),
  active: true,
  maxTokensOut: 0,
  defaultTemperature: 0,
};

// Inside an initialized PolicySynthAgent subclass:
// const result = await this.callDecisions({ input, questions });
```

`seedAiModels` includes a Decisions model definition for new installations.
Existing installations must register and attach the model. With database usage
tracking enabled, a missing persisted Decisions model ID fails before the API
request. A chat model with the same API model name does not supply this identity.

Each successful request records raw and normalized usage with
`apiFamily: "decisions"`, accounting version 2, and dedicated model prices.
Question count/types and refusal count are recorded; input evidence and image
data are omitted. Usage persistence runs after API retries, so a database
persistence error does not repeat a successful API request.

## Configuration and input

`configureDecisions` accepts `apiKey`, `modelName`, `apiModelName`, `projectId`,
`timeoutMs`, `regionalProcessing`, and partial `prices`. Calling it replaces the
previous dedicated configuration. These settings apply to Decisions calls.

Credentials resolve from `PS_AGENT_OVERRIDE_OPENAI_API_KEY`, explicit
configuration or attached model access, then `OPENAI_API_KEY`. Simple agents can
also use `AI_MODEL_API_KEY` when `AI_MODEL_PROVIDER` is `openai`.
`OPENAI_ENFORCE_EU_REGION=true` or `regionalProcessing: "eu"` selects
`https://eu.api.openai.com/v1` and applies the configured regional price margin.
The client initializes on the first valid request.

Input can be a text string or user messages containing text and inline images:

```typescript
const request: PsDecisionRequest = {
  input: [{
    role: "user",
    content: [
      { type: "input_text", text: "Does this image contain a bus?" },
      { type: "input_image", image_url: "data:image/png;base64,..." },
    ],
  }],
  questions: [{ type: "predicate", instructions: "Is a bus visible?" }],
};
```

Replace the image placeholder with actual base64 data. All messages must have
the `user` role, and at most 128 image parts are allowed across a request.
External image URLs, file IDs, audio, tool calls, and item references are rejected.
At least one question is required. `safety_identifier` is forwarded when present.

Call options accept `timeoutMs`, `maxRetries`, and `signal: AbortSignal`.
The timeout defaults to `PS_MODEL_CALL_TIMEOUT_MS` or 600,000 ms. The SDK retries
transient failures twice by default; set `maxRetries: 0` to disable retries.
Cancellation is propagated through the SDK.

## Pricing

The dedicated defaults charge ordinary input at $0.10 per million tokens, or
$0.20 when total input exceeds 272,000 tokens. Cached input, cache writes, and
output have zero default charges. A configured EU region adds a 10% default
margin. The inclusive accounting threshold is therefore 272,001 tokens.
Prices can be overridden through the attached Decisions model or
`configureDecisions({ prices })` for the configured default model. Simple agents
use these prices independently of `PS_MODEL_IN_COST_USD` and
`PS_MODEL_OUT_COST_USD`.

See the official [Decisions guide](https://developers.openai.com/api/docs/guides/decisions),
[SDK reference](https://developers.openai.com/api/reference/typescript/resources/decisions/methods/create),
and [pricing](https://developers.openai.com/api/docs/pricing).
