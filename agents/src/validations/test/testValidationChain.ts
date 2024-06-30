import { PsAgentOrchestrator } from "../agentOrchestrator.js";
import { PsBaseValidationAgent } from "../baseValidationAgent.js";
import { PsClassificationAgent } from "../classificationAgent.js";
import { PsParallelValidationAgent } from "../parallelAgent.js";

const systemPrompt1 = `You are an expert validator.

###Evaluation steps###
Evaluate the sentence submitted by the user. The requirements for a valid sentence are:
1. It contains a subject, a verb and an object.
2. It is clearly stated.
3. It is not a compound sentence.
5. It is not a conditional sentence.
6. Could be true based on our general knowledge of the world.

YOU MUST GO THROUGH ALL OF THESE STEPS IN ORDER. DO NOT SKIP ANY STEPS.

###Chain of Thought Examples###

Sentence to validate: I love my car in the summer

Your evaluation in markdown and then JSON:

Evaluation steps:

1. **It contains a subject, a verb and an object.**
   - Subject: I
   - Verb: love
   - Object: my car
   - The sentence contains a subject, a verb, and an object.

2. **It is clearly stated.**
   - The sentence is clear and understandable.

3. **It is not a compound sentence.**
   - The sentence does not contain multiple independent clauses. It is not compound.

5. **It is not a conditional sentence.**
   - The phrase "in the summer" does imply a specific time condition under which the subject loves their car. This makes the sentence conditional, as it specifies the time when the love for the car is particularly felt.

6. **Could be true based on our general knowledge of the world.**
   - It is reasonable for someone to love their car, especially during a particular season like summer.

The sentence fails the evaluation at step 5 because it is a conditional sentence.

\`\`\`json
{ validationErrors:["It is a conditional sentence with a time condition."], "isValid": false  }
\`\`\`

###Output###

Step by step evaluation in markdown format.

Then JSON:

\`\`\`json
{ validationErrors?: <string[]> , isValid: <bool> }
\`\`\`
`;

const systemPrompt2 = `You are an expert classifier.

###Evaluation instructions###
Evaluate if the effect contains a derived metric, a direct metric or no metric. Then if there are metrics, what the metric is and what its direct components are.

Evaluate if there are more than one cause.

If there is only one cause and a derived metric then issue a validationError as this is strictly not allowed.

Do not issue a validation error if there is no metric.

###Output###
Output precise evaluation. Detail precisely whether the sentence contains a derived or a direct metric.

Step by step evaluation in markdown format.

Then JSON:

\`\`\`json
{ validationErrors?: <string[]> , classification:  "derived" |  " direct" | "nometric", moreThanOneCause:<bool>, isValid: true }
\`\`\`

`;

const systemPrompt3 = `
You are an expert in validating logic.

###Information###
We are building a logical cause-effect analysis. Your role is to access the causes provided and verify their validity and the validity of the logical connections between the causes and the effect.

###Evaluation Instructions###
Evaluate if the statement is a valid logical statement based on the following requirements:
1.  Check if the causes and effects could be reversed, sometimes the causes are mixed with effects.
2. No cause should contain causality.
3. The causes together should be sufficient to lead directly to the conclusion.

YOU MUST GO THROUGH ALL OF THESE STEPS IN ORDER. DO NOT SKIP ANY STEPS.

###Examples###
Cause 1: Investors have not shown interest in our company.
Cause 2: Other companies in the same market do attract investors.
Effect: Our business model is not attractive to investors.

Your evaluation in markdown and then JSON:

1. **Reversibility of Causes and Effect**:
   - Cause 1 ("Investors have not shown interest in our company") could be seen as an effect of the business model not being attractive. If the business model were indeed unattractive, it would lead to a lack of investor interest. Therefore, there is a potential reversibility issue here.
   - Cause 2 ("Other companies in the same market do attract investors") is not reversible with the effect as it is a comparative statement that does not imply causality.

2. **Absence of Causality in Causes**:
   - Cause 1, when considered independently, does not contain explicit causality, but in the context of the effect, it implies a result rather than a cause.
   - Cause 2 does not contain causality; it is a comparative observation.

3. **Sufficiency of Causes**:
   - Even if we accept Cause 1 as a valid cause, the combination of Cause 1 and Cause 2 does not necessarily lead directly to the conclusion that the business model is not attractive. There could be other factors influencing investor interest, such as market trends, leadership, financial stability, or even external economic conditions.

Conclusion:

The causes provided do not lead directly to the effect as stated. Cause 1 could be an effect itself, and the combination of both causes does not sufficiently explain the lack of attractiveness of the business model without additional information.

\`\`\`json
{
  "validationErrors": [
    "Cause 1 could be an effect itself and is potentially reversible with the stated effect.",
    "The causes are not sufficient to conclude that the business model alone is not attractive to investors without considering other potential factors."
  ],
  "isValid": false
}
\`\`\`

###Output###
Output precise evaluation. Detail precisely how the causes lead directly to the logical effect and if not, why.

Let's think step by step and output an evaluation in markdown format.

Then JSON:

\`\`\`json
{ validationErrors?: <string[]> , isValid: <bool> }
\`\`\`
`;

const systemPrompt4 = `
You are an expert in validating logic.

###Information###
We are building a logical cause-effect analysis. Your role is to assess each cause and the effect provided.

###Evaluation steps###
Evaluate if the causes and the effect can be regarded as a valid syllogistic statement based on the following requirements:
1. The statement should contain an effect and at least two causes.
2. The causes should be connected laterally so that the subject of the second cause is a word referred to in the predicate of the first cause.
3. The effect should only contain subjects and predicates included in the causes.
4. Together, the causes are sufficient to lead to the effect.

YOU MUST GO THROUGH ALL OF THESE STEPS IN ORDER. DO NOT SKIP ANY STEPS.

###Output###
Output precise evaluation. Detail precisely how the causes are laterally connected. Detail precisely which subjects and which predicates from the causes are contained in the effect. Detail if the causes are not sufficient to lead to the effect.

Step by step evaluation in markdown format.

Then JSON:

\`\`\`json
{ validationErrors?: <string[]> , isValid: <bool> }
\`\`\`
`;

const systemPrompt5 = `
You are an expert in validating logic.

###Information###
We are building a logical cause-effect analysis. Your role is to assess each cause and the effect provided.

###Evaluation steps###
Evaluate if the causes and the effect can be regarded as a valid syllogistic statement based on the following requirements:
1. The statement should contain an effect and at least two causes.
2. The subject of the effect should be a derived metric.
2. The causes should be connected through the derived metric so that the subject of the second cause is a component of the derived metric and the predicate of the second cause refers to another component of the derived metric.
3. The metric contained in the effect should be derived from components contained in the causes.
4. No cause should contain causality.

YOU MUST GO THROUGH ALL OF THESE STEPS IN ORDER. DO NOT SKIP ANY STEPS.

###Output###
Output precise evaluation. Detail precisely how the causes are laterally connected. Detail precisely which subjects and which predicates from the causes are contained in the effect through the derived metric. Detail if the causes are not sufficient to lead to the effect.

Step by step evaluation in markdown format.

Then JSON:

\`\`\`json
{ validationErrors?: <string[]> , isValid: <bool> }
\`\`\`
`;

const systemPrompt6 = `
You are an expert in validating logic.

###Information###
We are building a logical cause-effect analysis. Your role is to assess each cause and the effect provided.

###Evaluation steps###
Evaluate if the causes and the effect can be regarded as a valid syllogistic statement based on the following requirements:
1. The statement should contain an effect and one cause.
2. The effect should only contain subjects and predicates included in the cause.
3. The cause is sufficient to lead to the effect.

YOU MUST GO THROUGH ALL OF THESE STEPS IN ORDER. DO NOT SKIP ANY STEPS.

###Output###
Output precise evaluation. Detail precisely which subjects and which predicates from the cause are contained in the effect. Detail if the cause is not sufficient to lead to the effect.

Step by step evaluation in markdown format.

Then JSON:

\`\`\`json
{ validationErrors?: <string[]> , isValid: <bool> }
\`\`\`

`;

//const effect = `Our business model is not attractive to investors`;
//const causees = [`Investors have not shown interest in our company`, `Other companies in the same market do attract investors`];

const effect = `Car's engine will not start`;
const causees = [`Engine needs fuel in order to run`, `Fuel is not getting into the engine`];

//const effect = `Our survival is at stake`;
//const causees = [`Surviving in this competitive business requires frequent investments`,`Our financial resources are more and more limited`];

let userMessage = `Effect: ${effect}\n`;
causees.forEach((cause, index) => {
  userMessage += `Cause ${index + 1}: ${cause}\n`;
});

const streamingCallbacks = [
  {
    handleLLMNewToken(token: string) {
      process.stdout.write(token);
    },
  },
] as any;

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

if (causees.length <= 1) {
  validLogicalStatement.nextAgent = syllogisticEvaluationSingleCause;
} else {
  validLogicalStatement.nextAgent = classification;
}

classification.addRoute("derived", syllogisticEvaluationDerived);
classification.addRoute("direct", syllogisticEvaluationMoreThanOne);
classification.addRoute("nometric", syllogisticEvaluationMoreThanOne);

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

const parallelAgent = new PsParallelValidationAgent(
  "Parallel Sentence Validation",
  {},
  [effectSentenceValidator, ...sentenceValidators]
);

parallelAgent.nextAgent = validLogicalStatement;

const result = await agentOrchestrator.execute(parallelAgent, effect);

console.log(
  `Results: ${result.isValid} ${JSON.stringify(result.validationErrors)}`
);

process.exit(0);
