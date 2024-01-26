import WebSocket from "ws";
import { PsBaseValidationAgent } from "@policysynth/agents/validations/baseValidationAgent.js";
import { PsAgentOrchestrator } from "@policysynth/agents/validations/agentOrchestrator.js";
import { PsClassificationAgent } from "@policysynth/agents/validations/classificationAgent.js";
import { PsParallelValidationAgent } from "@policysynth/agents/validations/parallelAgent.js";

const systemPrompt1 = `You are an expert validator.

###Evaluation steps###
Evaluate the sentence submitted by the user. The requirements for a valid sentence are:
1. Has a subject, a verb, and an object.
2. Is easy to understand.
3. Is simple, not combined with another sentence.
4. Might suggest a need but not a guarantee.
5. Seems true based on common knowledge.

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

4. **It does not imply a sufficiency relationship.**
   - The sentence does not explicitly state a sufficiency relationship.

5. **Could be true based on our general knowledge of the world.**
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
A derived metric, direct metric, or no metric.
Identify the metric and its basic parts, if any.
Check if there's more than one cause.

If only one cause and a derived metric, give a validation error.

No error if there's no metric.

###Output###
Give a clear evaluation. Specify if the sentence has a derived or a direct metric.

Step by step evaluation in markdown format.

Then JSON:

\`\`\`json
{ validationErrors?: <string[]> , classification: "derived" | " direct" | "nometric", moreThanOneCause:<bool>, isValid: true }
\`\`\`

`;

const systemPrompt3 = `
You are an expert in validating logic.

###Information###
Your job is to check the causes given and make sure they are valid and logically connected to the effect.

###Evaluation Instructions###
Check if the statement makes logical sense by:

1. Seeing if causes and effects can be switched, as they might be mixed up.
2. Making sure no cause includes causality.
3. Ensuring all causes together directly lead to the conclusion.

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
Your job is to evaluate each cause and the effect in our logical analysis.

###Evaluation steps###
Check if the causes and effect form a valid syllogism by:
1. Making sure the second cause relates to something mentioned in the first cause.
2. Ensuring there's an effect and at least two causes.
3. Confirming the effect only includes elements from the causes.
4. Verifying that the causes together fully lead to the effect.

YOU MUST GO THROUGH ALL OF THESE STEPS IN ORDER. DO NOT SKIP ANY STEPS.

###Output###
Give a detailed evaluation:

1. Explain how the causes are connected to each other.
2. Specify which subjects and predicates from the causes are in the effect.
3. State if the causes don't fully lead to the effect.

Step by step evaluation in markdown format.

Then JSON:

\`\`\`json
{ validationErrors?: <string[]> , isValid: <bool> }
\`\`\`
`;

const systemPrompt5 = `
You are an expert in validating logic.

###Information###
Your task is to evaluate each cause and the effect in our logical analysis.

###Evaluation steps###
Check if the causes and effect make a valid syllogism by:

1. Having an effect and at least two causes.
2. The effect's subject must be a derived metric.
3. The causes must link through this metric, with the second cause's subject being part of the metric and its predicate referring to another metric component.
4. The effect's metric should come from the causes' components.
5. Causes should not include causality.

YOU MUST GO THROUGH ALL OF THESE STEPS IN ORDER. DO NOT SKIP ANY STEPS.

###Output###
Provide a detailed evaluation:

1. Explain exactly how the causes are connected side by side.
2. Clearly identify which subjects and predicates from the causes are included in the effect via the derived metric.
3. State if the causes are not enough to result in the effect.

Step by step evaluation in markdown format.

Then JSON:

\`\`\`json
{ validationErrors?: <string[]> , isValid: <bool> }
\`\`\`
`;

const systemPrompt6 = `
You are an expert in validating logic.

###Information###
Your task is to check each cause and the resulting effect in our logical analysis.

###Evaluation steps###
Check if the cause and effect form a valid syllogism by:

1. Including one cause and one effect in the statement.
2. Making sure the effect only has elements from the cause.
3. Ensuring the cause alone can lead to the effect.

YOU MUST GO THROUGH ALL OF THESE STEPS IN ORDER. DO NOT SKIP ANY STEPS.

###Output###
Give a detailed evaluation:

1. Clearly identify which subjects and predicates from the cause are in the effect.
2. State if the cause isn't enough to result in the effect.

Step by step evaluation in markdown format.

Then JSON:

\`\`\`json
{ validationErrors?: <string[]> , isValid: <bool> }
\`\`\`

`;

export const renderUserMessage = (
  effect: string,
  causes: string[],
  valdiationReview: string
) => {
  const prompt = `Effect: ${effect}
${causes
  .map(
    (cause, index) => `Cause${causes.length > 1 ? ` ${index}` : ""}: ${cause}`
  )
  .join("\n")}
Expert validation review: ${valdiationReview}
`;

  return prompt;
};

export const runValidationChain = async (
  crt: LtpCurrentRealityTreeData,
  clientId: string,
  wsClients: Map<string, WebSocket>,
  parentNode: LtpCurrentRealityTreeDataNode,
  currentUDE: string,
  chatLog: PsSimpleChatLog[],
  parentNodes: LtpCurrentRealityTreeDataNode[] | undefined = undefined,
  effect: string,
  causes: string[],
  validationReview: string,
  customSystemPrompts: Map<number, string> | undefined = undefined
) => {
  console.log("runValidationChain called");
  console.log(`parentNode: ${JSON.stringify(parentNode, null, 2)}
               currentUDE: ${currentUDE}
               parentNodes: ${JSON.stringify(parentNodes, null, 2)}`);
  let parentNodeType: CrtNodeType;

  if (!parentNode) {
    parentNodeType = "ude";
  } else if (parentNode.type == "ude") {
    parentNodeType = "directCause";
  } else {
    parentNodeType = "directCause";
  }

  console.log(`nodeType: ${parentNodeType}`);

  const webSocket = wsClients.get(clientId);
  if (!webSocket) {
    console.error(
      `WS Client ${clientId} not found in streamWebSocketResponses`
    );
    return;
  }

  const agentOrchestrator = new PsAgentOrchestrator();

  const userMessage = renderUserMessage(effect, causes, validationReview);

  const classification = new PsClassificationAgent("Metric Cassification", {
    systemMessage:
      customSystemPrompts &&
      customSystemPrompts.has(2) &&
      customSystemPrompts.get(2) != ""
        ? customSystemPrompts.get(2)
        : systemPrompt2,
    userMessage,
    webSocket,
  });

  const syllogisticEvaluationMoreThanOne = new PsBaseValidationAgent(
    "Syllogistic Evaluation (More than one cause)",
    {
      systemMessage:
        customSystemPrompts &&
        customSystemPrompts.has(4) &&
        customSystemPrompts.get(4) != ""
          ? customSystemPrompts.get(4)
          : systemPrompt4,
      userMessage,
      webSocket,
    }
  );

  const syllogisticEvaluationDerived = new PsBaseValidationAgent(
    "Syllogistic Evaluation (Derived metric)",
    {
      systemMessage:
        customSystemPrompts &&
        customSystemPrompts.has(5) &&
        customSystemPrompts.get(5) != ""
          ? customSystemPrompts.get(5)
          : systemPrompt5,
      userMessage,
      webSocket,
    }
  );

  const syllogisticEvaluationSingleCause = new PsBaseValidationAgent(
    "Syllogistic Evaluation (Single cause)",
    {
      systemMessage:
        customSystemPrompts &&
        customSystemPrompts.has(6) &&
        customSystemPrompts.get(6) != ""
          ? customSystemPrompts.get(6)
          : systemPrompt6,
      userMessage,
      webSocket,
    }
  );

  const validLogicalStatement = new PsBaseValidationAgent(
    "Statements Logic Validation",
    {
      systemMessage:
        customSystemPrompts &&
        customSystemPrompts.has(3) &&
        customSystemPrompts.get(3) != ""
          ? customSystemPrompts.get(3)
          : systemPrompt3,
      userMessage,
      webSocket,
    }
  );

  if (causes.length <= 1) {
    validLogicalStatement.nextAgent = syllogisticEvaluationSingleCause;
  } else {
    validLogicalStatement.nextAgent = classification;
  }

  classification.addRoute("derived", syllogisticEvaluationDerived);
  classification.addRoute("direct", syllogisticEvaluationMoreThanOne);
  classification.addRoute("nometric", syllogisticEvaluationMoreThanOne);

  const sentenceValidators = causes.map((cause, index) => {
    return new PsBaseValidationAgent(`Cause ${index} Sentence Validator`, {
      systemMessage:
        customSystemPrompts &&
        customSystemPrompts.has(1) &&
        customSystemPrompts.get(1) != ""
          ? customSystemPrompts.get(1)
          : systemPrompt1,
      userMessage: `Sentence to validate: ${cause}\n\nYour evaluation in markdown and then JSON:\n`,
      disableStreaming: true,
      webSocket,
    });
  });

  const effectSentenceValidator = new PsBaseValidationAgent(
    "Effect Sentence Validator",
    {
      systemMessage:
        customSystemPrompts &&
        customSystemPrompts.has(1) &&
        customSystemPrompts.get(1) != ""
          ? customSystemPrompts.get(1)
          : systemPrompt1,

      userMessage: `Sentence to validated: ${effect}\n\nYour evaluation in markdown and then JSON:\n`,
      disableStreaming: true,
      webSocket,
    }
  );

  const parallelAgent = new PsParallelValidationAgent(
    "Basic Sentence Validation",
    {
      webSocket,
      hasNoStreaming: true,
    },
    [...sentenceValidators]
  );

  parallelAgent.nextAgent = validLogicalStatement;

  agentOrchestrator.execute(parallelAgent, effect);
};
