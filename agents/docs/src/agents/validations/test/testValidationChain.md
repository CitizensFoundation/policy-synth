# PsAgentOrchestrator

The `PsAgentOrchestrator` class is responsible for orchestrating the execution of various agents that perform validation and classification tasks based on prompts and user messages.

## Properties

| Name                | Type   | Description               |
|---------------------|--------|---------------------------|
| No properties       | -      | This class has no public properties. |

## Methods

| Name    | Parameters | Return Type | Description |
|---------|------------|-------------|-------------|
| execute | agent: PsBaseValidationAgent, effect: string | Promise<any> | Executes the given agent with the provided effect string and returns the result of the execution. |

## Examples

```typescript
// Example usage of the PsAgentOrchestrator
const agentOrchestrator = new PsAgentOrchestrator();
const result = await agentOrchestrator.execute(parallelAgent, effect);
console.log(`Results: ${result.isValid} ${JSON.stringify(result.validationErrors)}`);
```

# PsBaseValidationAgent

The `PsBaseValidationAgent` class is a base class for agents that perform validation tasks based on a system prompt and a user message.

## Properties

| Name           | Type   | Description               |
|----------------|--------|---------------------------|
| systemMessage  | string | The system prompt message used for validation. |
| userMessage    | string | The user message that needs to be validated. |
| streamingCallbacks | Callbacks | Callbacks for handling streaming output. |
| disableStreaming | boolean | Flag to disable streaming output. |
| nextAgent      | PsBaseValidationAgent | The next agent to execute after the current one. |

## Methods

| Name    | Parameters | Return Type | Description |
|---------|------------|-------------|-------------|
| addRoute | key: string, agent: PsBaseValidationAgent | void | Adds a routing path to the next agent based on a key. |

## Examples

```typescript
// Example usage of the PsBaseValidationAgent
const validLogicalStatement = new PsBaseValidationAgent(
  "validLogicalStatement", {
    systemMessage: systemPrompt3,
    userMessage,
    streamingCallbacks
  }
);
```

# PsClassificationAgent

The `PsClassificationAgent` class is used for classifying a user message based on a system prompt.

## Properties

| Name           | Type   | Description               |
|----------------|--------|---------------------------|
| systemMessage  | string | The system prompt message used for classification. |
| userMessage    | string | The user message that needs to be classified. |
| streamingCallbacks | Callbacks | Callbacks for handling streaming output. |

## Methods

| Name    | Parameters | Return Type | Description |
|---------|------------|-------------|-------------|
| addRoute | key: string, agent: PsBaseValidationAgent | void | Adds a routing path to the next agent based on a classification key. |

## Examples

```typescript
// Example usage of the PsClassificationAgent
const classification = new PsClassificationAgent("Metric Cassification", {
  systemMessage: systemPrompt2,
  userMessage,
  streamingCallbacks,
});
```

# PsParallelValidationAgent

The `PsParallelValidationAgent` class is used for performing parallel validation of multiple sentences.

## Properties

| Name           | Type   | Description               |
|----------------|--------|---------------------------|
| agents         | PsBaseValidationAgent[] | An array of agents to be executed in parallel. |
| nextAgent      | PsBaseValidationAgent | The next agent to execute after the parallel validation. |

## Methods

| Name    | Parameters | Return Type | Description |
|---------|------------|-------------|-------------|
| No methods | - | - | This class has no public methods. |

## Examples

```typescript
// Example usage of the PsParallelValidationAgent
const parallelAgent = new PsParallelValidationAgent(
  "Parallel Sentence Validation",
  {},
  [effectSentenceValidator, ...sentenceValidators]
);
parallelAgent.nextAgent = validLogicalStatement;
```

Please note that the provided code snippet is part of a larger system and the classes interact with each other to perform complex validation and classification tasks. The examples given are for illustrative purposes and may not function as standalone code.