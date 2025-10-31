# TestValidationChain

This script demonstrates a validation chain for logical cause-effect analysis using PolicySynth agents. It orchestrates a series of validation and classification agents to evaluate the logical structure and validity of a set of causes and an effect, following a step-by-step reasoning process. The script is intended for testing and demonstration purposes.

## Overview

The validation chain is constructed using several agent classes from the PolicySynth framework:

- **PsBaseValidationAgent**: Performs step-by-step validation of sentences or logical statements.
- **PsClassificationAgent**: Classifies whether a metric is "derived", "direct", or "nometric" and checks for multiple causes.
- **PsParallelValidationAgent**: Runs multiple validation agents in parallel (e.g., sentence-level validation for each cause and the effect).
- **PsAgentOrchestrator**: Orchestrates the execution of agents in a chain or tree structure.

The script defines several system prompts for different validation and classification tasks, then builds a validation chain that adapts based on the number of causes and the classification of the effect.

## Example Path

`@policysynth/agents/validations/test/testValidationChain.js`

## Main Components

### System Prompts

Several system prompts are defined to guide the agents in their validation and classification tasks. Each prompt provides detailed instructions and output formatting requirements for the agent.

### Agent Chain Construction

The script constructs a validation chain as follows:

1. **Sentence Validation**: Each cause and the effect are validated for sentence structure using `PsBaseValidationAgent`.
2. **Parallel Validation**: All sentence validators are run in parallel using `PsParallelValidationAgent`.
3. **Logical Statement Validation**: The results are passed to a logical statement validator (`validLogicalStatement`).
4. **Classification**: If there are multiple causes, the effect is classified as "derived", "direct", or "nometric" using `PsClassificationAgent`.
5. **Syllogistic Evaluation**: Based on the classification, further validation is performed using specialized agents for syllogistic reasoning.

### Execution

The chain is executed using the `PsAgentOrchestrator`, and the final result is logged.

## Properties

| Name                    | Type                                      | Description                                                                                 |
|-------------------------|-------------------------------------------|---------------------------------------------------------------------------------------------|
| systemPrompt1-6         | `string`                                  | System prompts for various validation and classification tasks.                              |
| effect                  | `string`                                  | The effect statement to be validated.                                                       |
| causees                 | `string[]`                                | Array of cause statements to be validated.                                                  |
| userMessage             | `string`                                  | Formatted user message combining effect and causes.                                         |
| streamingCallbacks      | `any[]`                                   | Callbacks for streaming LLM output tokens to stdout.                                        |
| agentOrchestrator       | `PsAgentOrchestrator`                     | Orchestrator for executing the agent chain.                                                 |
| classification          | `PsClassificationAgent`                   | Agent for classifying the effect as "derived", "direct", or "nometric".                     |
| syllogisticEvaluation*  | `PsBaseValidationAgent`                   | Agents for syllogistic evaluation based on the number/type of causes and metrics.           |
| validLogicalStatement   | `PsBaseValidationAgent`                   | Agent for validating the logical statement as a whole.                                      |
| sentenceValidators      | `PsBaseValidationAgent[]`                 | Array of agents for validating each cause sentence.                                         |
| effectSentenceValidator | `PsBaseValidationAgent`                   | Agent for validating the effect sentence.                                                   |
| parallelAgent           | `PsParallelValidationAgent`               | Agent for running all sentence validators in parallel.                                      |
| result                  | `PsValidationAgentResult` (Promise)       | The final result of the validation chain execution.                                         |

## Methods

| Name         | Parameters         | Return Type         | Description                                                                                 |
|--------------|--------------------|---------------------|---------------------------------------------------------------------------------------------|
| execute      | (agent, input)     | `Promise<any>`      | Executes the agent chain starting from the given agent with the provided input.              |

## Example

```typescript
import { PolicySynthAgentBase } from "../../base/agentBase.js";
import { PsAgentOrchestrator } from "../agentOrchestrator.js";
import { PsBaseValidationAgent } from "../baseValidationAgent.js";
import { PsClassificationAgent } from "../classificationAgent.js";
import { PsParallelValidationAgent } from "../parallelAgent.js";

// Define effect and causes
const effect = `Car's engine will not start`;
const causees = [`Engine needs fuel in order to run`, `Fuel is not getting into the engine`];

// Build user message
let userMessage = `Effect: ${effect}\n`;
causees.forEach((cause, index) => {
  userMessage += `Cause ${index + 1}: ${cause}\n`;
});

// Streaming callback for LLM output
const streamingCallbacks = [
  {
    handleLLMNewToken(token: string) {
      process.stdout.write(token);
    },
  },
];

// Instantiate orchestrator and agents
const agentOrchestrator = new PsAgentOrchestrator();

const classification = new PsClassificationAgent("Metric Cassification", {
  systemMessage: systemPrompt2,
  userMessage,
  streamingCallbacks,
});

const syllogisticEvaluationMoreThanOne = new PsBaseValidationAgent(
  "Syllogistic Evaluation (More than one cause)", {
    systemMessage: systemPrompt4,
    userMessage,
    streamingCallbacks
  }
);

const syllogisticEvaluationDerived = new PsBaseValidationAgent(
  "Syllogistic Evaluation (Derived metric)", {
    systemMessage: systemPrompt5,
    userMessage,
    streamingCallbacks
  }
);

const syllogisticEvaluationSingleCause = new PsBaseValidationAgent(
  "Syllogistic Evaluation (Single cause)", {
    systemMessage: systemPrompt6,
    userMessage,
    streamingCallbacks
  }
);

const validLogicalStatement = new PsBaseValidationAgent(
  "validLogicalStatement", {
    systemMessage: systemPrompt3,
    userMessage,
    streamingCallbacks
  }
);

// Chain the agents based on number of causes
if (causees.length <= 1) {
  validLogicalStatement.nextAgent = syllogisticEvaluationSingleCause;
} else {
  validLogicalStatement.nextAgent = classification;
}

classification.addRoute("derived", syllogisticEvaluationDerived);
classification.addRoute("direct", syllogisticEvaluationMoreThanOne);
classification.addRoute("nometric", syllogisticEvaluationMoreThanOne);

// Sentence validators for each cause and the effect
const sentenceValidators = causees.map((cause, index) => {
  return new PsBaseValidationAgent(
    `Cause ${index} Sentence Validator`, {
      systemMessage: systemPrompt1,
      userMessage: `Sentence to validate: ${cause}\n\nYour evaluation in markdown and then JSON:\n`,
      disableStreaming: true
    }
  );
});

const effectSentenceValidator = new PsBaseValidationAgent(
  "Effect Sentence Validator", {
    systemMessage: systemPrompt1,
    userMessage:  `Sentence to validated: ${effect}\n\nYour evaluation in markdown and then JSON:\n`,
    disableStreaming: true
  }
);

// Parallel validation of sentences
const parallelAgent = new PsParallelValidationAgent(
  "Parallel Sentence Validation",
  {},
  [effectSentenceValidator, ...sentenceValidators]
);

parallelAgent.nextAgent = validLogicalStatement;

// Execute the chain
const result = await agentOrchestrator.execute(parallelAgent, effect);

PolicySynthAgentBase.logger.info(
  `Results: ${result.isValid} ${JSON.stringify(result.validationErrors)}`
);

process.exit(0);
```

## Usage Notes

- The script is designed for Node.js and uses ES module imports.
- The agent chain is highly configurable and can be adapted for different logical validation scenarios by modifying the system prompts and agent chaining logic.
- The output is streamed to stdout and logged using the PolicySynth logger.
- The validation chain can be extended with additional agents or custom logic as needed.

---

**Types Used:**

- `PsBaseValidationAgent`
- `PsClassificationAgent`
- `PsParallelValidationAgent`
- `PsAgentOrchestrator`
- `PsValidationAgentResult`

See the [AllTypeDefsUsedInProject] for detailed type definitions.