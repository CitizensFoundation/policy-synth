# PolicySynthStandaloneAgent

The `PolicySynthStandaloneAgent` is a standalone agent class for PolicySynth that operates without any database or Redis dependencies. It is designed for environments where persistent storage is not required, and all configuration (such as AI model selection) is provided via environment variables or direct instantiation. This agent is ideal for command-line tools, stateless services, or testing scenarios.

## Properties

| Name          | Type                                 | Description                                                                                 |
|---------------|--------------------------------------|---------------------------------------------------------------------------------------------|
| memory        | `Record<string, unknown>`            | In-memory store for agent state, such as conversation history or temporary variables.        |
| modelManager  | `PsAiModelManager`                   | Manages AI model selection and invocation, initialized without DB or Redis dependencies.     |

## Getters

| Name                | Type                | Description                                              |
|---------------------|---------------------|----------------------------------------------------------|
| maxModelTokensOut   | `number`            | Maximum output tokens for the model (default: 16384).    |
| modelTemperature    | `number`            | Temperature setting for model randomness (default: 0.7). |
| reasoningEffort     | `"low" \| "medium" \| "high"` | Reasoning effort for the model (default: "medium").      |
| maxThinkingTokens   | `number`            | Maximum tokens for "thinking" (default: 0).              |

## Constructor

| Parameter | Type                      | Description                                      |
|-----------|---------------------------|--------------------------------------------------|
| memory    | `Record<string, unknown>` | (Optional) Initial memory object for the agent.   |

**Behavior:**  
- Initializes the agent with an in-memory store.
- Sets up the `PsAiModelManager` with no DB models or access configuration.
- Overrides the model manager's token usage saving to log to console instead of persisting.

## Methods

| Name        | Parameters                                                                                                                                                                                                 | Return Type      | Description                                                                                                    |
|-------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------|----------------------------------------------------------------------------------------------------------------|
| process     | None                                                                                                                                                                                                       | `Promise<void>`  | Main processing logic for the agent. Override this method to implement custom agent behavior.                  |
| callModel   | <ul><li>modelType: `PsAiModelType`</li><li>modelSize: `PsAiModelSize`</li><li>messages: `PsModelMessage[]`</li><li>options?: `PsCallModelOptions`</li></ul>           | `Promise<any>`   | Delegates a model call to the model manager. Handles message passing and model invocation.                     |

### Method Details

#### process

```typescript
async process(): Promise<void>
```
- Logs the start of processing. Intended to be overridden for custom agent logic.

#### callModel

```typescript
async callModel(
  modelType: PsAiModelType,
  modelSize: PsAiModelSize,
  messages: PsModelMessage[],
  options: PsCallModelOptions = {
    parseJson: false,
    limitedRetries: false,
    tokenOutEstimate: 120,
    streamingCallbacks: undefined
  }
): Promise<any>
```
- Forwards the call to the internal `modelManager` to interact with the AI model.
- Supports options for JSON parsing, retry limits, token estimation, and streaming callbacks.

## Example

```typescript
import { PolicySynthStandaloneAgent } from '@policysynth/agents/base/agentStandalone.js';
import { PsAiModelType, PsAiModelSize } from '@policysynth/agents/aiModelTypes.js';

// Instantiate the agent with optional initial memory
const agent = new PolicySynthStandaloneAgent({
  conversationId: "abc123"
});

// Example: Call a model with a simple message
const response = await agent.callModel(
  PsAiModelType.OpenAI, // e.g., "openai"
  PsAiModelSize.Large,  // e.g., "large"
  [
    { role: "user", message: "What is PolicySynth?" }
  ],
  {
    parseJson: false,
    limitedRetries: true,
    tokenOutEstimate: 100
  }
);

console.log("Model response:", response);

// Custom processing logic (override in subclass)
await agent.process();
```

---

**Note:**  
- This agent is stateless and does not persist any data outside of its in-memory store.
- Methods that require database or Redis access are intentionally omitted for standalone operation.
- All AI model configuration must be provided via environment variables or direct instantiation.