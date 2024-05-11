# PsAgentOrchestrator

This class orchestrates the execution of various agents for processing and validation tasks.

## Properties

No properties are documented for this class.

## Methods

| Name    | Parameters | Return Type | Description                             |
|---------|------------|-------------|-----------------------------------------|
| execute | agent: PsBaseValidationAgent, input: any | Promise<any> | Executes the given agent with the specified input and returns the result. |

## Example

```typescript
import { PsAgentOrchestrator } from '@policysynth/agents/validations/test/testValidationChain.js';

const agentOrchestrator = new PsAgentOrchestrator();
const result = await agentOrchestrator.execute(someAgent, someInput);
```

---

# PsBaseValidationAgent

This class represents a base agent for validation tasks, capable of handling system and user messages.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| systemMessage | string | The system message for validation. |
| userMessage   | string | The user message to be validated. |
| streamingCallbacks | Callbacks | Callbacks for handling streaming outputs. |
| disableStreaming | boolean | Flag to disable streaming, if necessary. |
| nextAgent     | PsBaseValidationAgent | The next agent to execute in the chain. |

## Methods

| Name       | Parameters        | Return Type | Description                 |
|------------|-------------------|-------------|-----------------------------|
| addRoute   | key: string, agent: PsBaseValidationAgent | void | Adds a routing path for the agent based on the given key. |

## Example

```typescript
import { PsBaseValidationAgent } from '@policysynth/agents/validations/test/testValidationChain.js';

const validationAgent = new PsBaseValidationAgent("Example Agent", {
  systemMessage: "System prompt here",
  userMessage: "User message here",
  streamingCallbacks: someCallbacks
});
```

---

# PsClassificationAgent

This class extends PsBaseValidationAgent for classification tasks.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| classificationType | string | The type of classification performed by the agent. |

## Methods

No additional methods documented beyond those inherited from PsBaseValidationAgent.

## Example

```typescript
import { PsClassificationAgent } from '@policysynth/agents/validations/test/testValidationChain.js';

const classificationAgent = new PsClassificationAgent("Metric Classification", {
  systemMessage: "System prompt for classification",
  userMessage: "User message for classification",
  streamingCallbacks: someCallbacks
});
```

---

# PsParallelValidationAgent

This class is used to execute multiple validation agents in parallel.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| agents        | PsBaseValidationAgent[] | Array of agents to be executed in parallel. |

## Methods

| Name       | Parameters        | Return Type | Description                 |
|------------|-------------------|-------------|-----------------------------|
| setAgents  | agents: PsBaseValidationAgent[] | void | Sets the agents to be executed in parallel. |

## Example

```typescript
import { PsParallelValidationAgent } from '@policysynth/agents/validations/test/testValidationChain.js';

const parallelAgent = new PsParallelValidationAgent("Parallel Agent", {}, [agent1, agent2]);
```

---

# Callbacks

This type defines the structure for callbacks used in streaming scenarios.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| handleLLMNewToken | (token: string) => void | Function to handle new tokens from a language model. |

## Example

```typescript
import { Callbacks } from '@langchain/core/callbacks/manager';

const callbacks: Callbacks = {
  handleLLMNewToken: (token: string) => {
    console.log(token);
  }
};
```