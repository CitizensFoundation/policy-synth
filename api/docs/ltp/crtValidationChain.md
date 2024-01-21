# OpenAI

The `OpenAI` class is a representation of the OpenAI API client.

## Properties

| Name     | Type   | Description                        |
|----------|--------|------------------------------------|
| apiKey   | string | The API key for accessing OpenAI.  |

## Methods

| Name       | Parameters | Return Type | Description |
|------------|------------|-------------|-------------|
| constructor| apiKey: string | OpenAI | Initializes the OpenAI client with the provided API key. |

# Stream

The `Stream` class is part of the OpenAI streaming module.

## Methods

| Name       | Parameters | Return Type | Description |
|------------|------------|-------------|-------------|
| constructor| options: any | Stream | Initializes the Stream with the provided options. |

# hrtime

The `hrtime` function is a utility to get high-resolution real time.

## Methods

| Name       | Parameters | Return Type | Description |
|------------|------------|-------------|-------------|
| hrtime     | time?: [number, number] | [number, number] | Returns the current high-resolution real time in a [seconds, nanoseconds] tuple. If a previous time is provided, it returns the difference. |

# uuidv4

The `uuidv4` function generates random UUIDs.

## Methods

| Name       | Parameters | Return Type | Description |
|------------|------------|-------------|-------------|
| uuidv4     | -          | string      | Generates and returns a random UUID (version 4). |

# WebSocket

The `WebSocket` class provides a client for connecting to WebSocket servers.

## Methods

| Name       | Parameters | Return Type | Description |
|------------|------------|-------------|-------------|
| constructor| address: string, options?: WebSocket.ClientOptions | WebSocket | Initializes a new WebSocket connection to the provided address with optional configurations. |

# PsBaseValidationAgent

The `PsBaseValidationAgent` class is a base class for validation agents.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| systemMessage | string | The system message used for validation. |
| userMessage   | string | The user message to be validated. |
| webSocket     | WebSocket | The WebSocket connection for communication. |

## Methods

| Name       | Parameters | Return Type | Description |
|------------|------------|-------------|-------------|
| constructor| options: ValidationAgentOptions | PsBaseValidationAgent | Initializes the validation agent with the provided options. |

# PsAgentOrchestrator

The `PsAgentOrchestrator` class is responsible for orchestrating the execution of validation agents.

## Methods

| Name       | Parameters | Return Type | Description |
|------------|------------|-------------|-------------|
| execute    | agent: PsBaseValidationAgent, effect: string | void | Executes the validation chain starting with the provided agent and effect. |

# PsClassificationAgent

The `PsClassificationAgent` class is a specialized validation agent for classification tasks.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| name          | string | The name of the classification agent. |
| options       | ValidationAgentOptions | The options for the classification agent. |

## Methods

| Name       | Parameters | Return Type | Description |
|------------|------------|-------------|-------------|
| constructor| name: string, options: ValidationAgentOptions | PsClassificationAgent | Initializes the classification agent with the provided name and options. |
| addRoute   | outcome: string, agent: PsBaseValidationAgent | void | Adds a routing path for a specific outcome to another agent. |

# PsParallelValidationAgent

The `PsParallelValidationAgent` class is a validation agent that runs multiple validation agents in parallel.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| agents        | PsBaseValidationAgent[] | The array of validation agents to be run in parallel. |
| options       | ValidationAgentOptions | The options for the parallel validation agent. |

## Methods

| Name       | Parameters | Return Type | Description |
|------------|------------|-------------|-------------|
| constructor| name: string, options: ValidationAgentOptions, agents: PsBaseValidationAgent[] | PsParallelValidationAgent | Initializes the parallel validation agent with the provided name, options, and agents. |

## Routes

No routes provided as this is not a controller.

## Examples

```typescript
// Example usage of the PsBaseValidationAgent
const validationAgentOptions = {
  systemMessage: "Your system message here.",
  userMessage: "Your user message here.",
  webSocket: new WebSocket('ws://example.com'),
};

const baseValidationAgent = new PsBaseValidationAgent(validationAgentOptions);
```

```typescript
// Example usage of the PsAgentOrchestrator
const agentOrchestrator = new PsAgentOrchestrator();
const baseValidationAgent = new PsBaseValidationAgent(validationAgentOptions);
agentOrchestrator.execute(baseValidationAgent, "The effect to validate.");
```

```typescript
// Example usage of the PsClassificationAgent
const classificationAgent = new PsClassificationAgent("Metric Classification", validationAgentOptions);
classificationAgent.addRoute("derived", new PsBaseValidationAgent(validationAgentOptions));
```

```typescript
// Example usage of the PsParallelValidationAgent
const parallelValidationAgent = new PsParallelValidationAgent("Basic Sentence Validation", validationAgentOptions, [baseValidationAgent]);
```
