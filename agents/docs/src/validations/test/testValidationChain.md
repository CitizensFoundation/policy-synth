# PsAgentOrchestrator

The orchestrator for PolicySynth agents, managing the execution and chaining of various validation and classification agents.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| No properties are explicitly defined in the provided code snippet. | | |

## Methods

| Name       | Parameters        | Return Type | Description                 |
|------------|-------------------|-------------|-----------------------------|
| execute    | agent: PsBaseValidationAgent, effect: string | Promise<any> | Executes the given agent with the provided effect, managing the flow of validation and classification tasks. |

## Example

```javascript
import { PsAgentOrchestrator } from '@policysynth/agents/validations/test/testValidationChain.js';

const agentOrchestrator = new PsAgentOrchestrator();
const effect = `Car's engine will not start`;
const causees = [`Engine needs fuel in order to run`, `Fuel is not getting into the engine`];

let userMessage = `Effect: ${effect}\n`;
causees.forEach((cause, index) => {
  userMessage += `Cause ${index + 1}: ${cause}\n`;
});

// Define your agents here

const result = await agentOrchestrator.execute(parallelAgent, effect);

console.log(`Results: ${result.isValid} ${JSON.stringify(result.validationErrors)}`);
```

# PsBaseValidationAgent

A base class for creating validation agents that can evaluate sentences, logic, or any other criteria based on a system prompt and user message.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| nextAgent     | PsBaseValidationAgent \| undefined | The next agent to execute in the validation chain. |

## Methods

| Name       | Parameters        | Return Type | Description                 |
|------------|-------------------|-------------|-----------------------------|
| addRoute   | key: string, agent: PsBaseValidationAgent | void | Adds a routing condition to direct the flow to different agents based on the evaluation result. |

## Example

```javascript
import { PsBaseValidationAgent } from '@policysynth/agents/validations/test/testValidationChain.js';

const systemPrompt = `Your system prompt here`;
const userMessage = `Your user message here`;

const validationAgent = new PsBaseValidationAgent("Agent Name", {
  systemMessage: systemPrompt,
  userMessage,
  // Optional properties
});

// Define next agent or routes if necessary
```

# PsParallelValidationAgent

A specialized agent for executing multiple validation agents in parallel, collecting and aggregating their results.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| agents        | PsBaseValidationAgent[] | The list of agents to be executed in parallel. |

## Methods

| Name       | Parameters        | Return Type | Description                 |
|------------|-------------------|-------------|-----------------------------|
| No specific methods are defined in the provided code snippet other than those inherited from its base class. | | | |

## Example

```javascript
import { PsParallelValidationAgent } from '@policysynth/agents/validations/test/testValidationChain.js';

const parallelAgent = new PsParallelValidationAgent(
  "Parallel Sentence Validation",
  {},
  [effectSentenceValidator, ...sentenceValidators]
);

// Define the next agent if necessary
parallelAgent.nextAgent = validLogicalStatement;
```

# PsClassificationAgent

A validation agent designed for classifying sentences based on specific criteria provided in the system prompt.

## Properties

| Name          | Type   | Description               |
|---------------|--------|---------------------------|
| No specific properties are defined in the provided code snippet other than those inherited from its base class. | | |

## Methods

| Name       | Parameters        | Return Type | Description                 |
|------------|-------------------|-------------|-----------------------------|
| addRoute   | key: string, agent: PsBaseValidationAgent | void | Adds a routing condition to direct the flow to different agents based on the classification result. |

## Example

```javascript
import { PsClassificationAgent } from '@policysynth/agents/validations/test/testValidationChain.js';

const classification = new PsClassificationAgent("Metric Classification", {
  systemMessage: systemPrompt2,
  userMessage,
  streamingCallbacks,
});

// Define routes based on classification results
classification.addRoute("derived", syllogisticEvaluationDerived);
classification.addRoute("direct", syllogisticEvaluationMoreThanOne);
classification.addRoute("nometric", syllogisticEvaluationMoreThanOne);
```