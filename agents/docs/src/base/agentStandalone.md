# PolicySynthStandaloneAgent

The `PolicySynthStandaloneAgent` is a standalone agent class for PolicySynth that operates without any database or Redis dependencies. It is designed for environments where persistent storage is not required, and all configuration (including AI model selection) is provided via environment variables or direct instantiation. This agent is ideal for command-line tools, stateless services, or testing scenarios.

## Properties

| Name          | Type                           | Description                                                                                 |
|---------------|--------------------------------|---------------------------------------------------------------------------------------------|
| memory        | `Record<string, unknown>`      | In-memory store for agent state, such as conversation history or temporary data.            |
| modelManager  | `PsAiModelManager`             | AI model manager instance, initialized without DB models or Redis.                          |

## Getters

| Name                | Type                         | Description                                                      |
|---------------------|-----------------------------|------------------------------------------------------------------|
| maxModelTokensOut   | `number`                    | Maximum number of output tokens for the model (default: 16384).  |
| modelTemperature    | `number`                    | Temperature setting for the model (default: 0.7).                |
| reasoningEffort     | `"low" \| "medium" \| "high"` | Reasoning effort for the model (default: "medium").              |
| maxThinkingTokens   | `number`                    | Maximum tokens for "thinking" (default: 0).                      |

## Constructor

```typescript
constructor(memory: Record<string, unknown> = {})
```

- **memory**: Optional initial memory object for the agent's in-memory state.

Initializes the agent, sets up the in-memory store, and configures the model manager with no database or Redis dependencies. Also overrides the model manager's token usage saving to log to the console instead of persisting.

## Methods

| Name         | Parameters                                                                                                                                                                                                 | Return Type      | Description                                                                                                   |
|--------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------|---------------------------------------------------------------------------------------------------------------|
| process      | none                                                                                                                                                                                                       | `Promise<void>`  | Main processing logic for the agent. Override this method to implement custom agent behavior.                 |
| callModel    | `modelType: PsAiModelType, modelSize: PsAiModelSize, messages: PsModelMessage[], options?: PsCallModelOptions`                                                                                            | `Promise<any>`   | Delegates a model call to the model manager. Handles message passing and model selection.                     |

### Method Details

#### process

```typescript
async process(): Promise<void>
```
Main processing logic for the standalone agent. By default, it logs a message. Override this method to implement custom agent behavior.

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
Delegates the call to the model manager, sending the provided messages to the selected AI model. Supports options for JSON parsing, retry logic, token estimation, and streaming callbacks.

- **modelType**: The type of the AI model to use.
- **modelSize**: The size of the AI model.
- **messages**: Array of messages to send to the model.
- **options**: Optional settings for the model call.

## Example

```typescript
import { PolicySynthStandaloneAgent } from '@policysynth/agents/base/agentStandalone.js';
import { PsAiModelType, PsAiModelSize } from '@policysynth/agents/aiModelTypes.js';

// Create a new standalone agent with optional initial memory
const agent = new PolicySynthStandaloneAgent({
  conversationId: 'abc123'
});

// Example: Call an AI model
const response = await agent.callModel(
  PsAiModelType.OpenAI,
  PsAiModelSize.Large,
  [
    { role: 'system', message: 'You are a helpful assistant.' },
    { role: 'user', message: 'What is the capital of France?' }
  ],
  {
    parseJson: false,
    limitedRetries: true,
    tokenOutEstimate: 50
  }
);

console.log('Model response:', response);

// Example: Override process method in a subclass
class MyCustomAgent extends PolicySynthStandaloneAgent {
  async process() {
    // Custom logic here
    const result = await this.callModel(
      PsAiModelType.OpenAI,
      PsAiModelSize.Medium,
      [{ role: 'user', message: 'Hello, agent!' }]
    );
    console.log('Custom process result:', result);
  }
}
```

---

**Note:**  
- This agent is stateless and does not persist any data outside of its in-memory store.
- All AI model configuration must be provided via environment variables or direct instantiation.
- Methods that require database or Redis access are intentionally omitted for standalone operation.