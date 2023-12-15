import { OpenAI } from "openai";
import { hrtime } from "process";
import { v4 as uuidv4 } from "uuid";
import WebSocket from "ws";

const DEBUGGING = true;

const config = {
  apiKey: process.env.OPENAI_KEY,
};

export const renderFirstUserPrompt = (
  currentUserMessage: string,
  currentRealityTree: LtpCurrentRealityTreeData,
  parentNode: LtpCurrentRealityTreeDataNode,
  currentUDE: string,
  parentNodes: LtpCurrentRealityTreeDataNode[] | undefined = undefined
) => {
  const parentIsUDE = parentNode.type === "ude";

  let userSuggestion = "";

  if (!parentNodes) {
    userSuggestion = "User suggested direct cause of UDE: ";
  } else {
    userSuggestion = "User suggested itntermediate or root cause of the cause above: ";
  }

  userSuggestion += currentUserMessage;

  if (parentNodes) {
    const test = parentNodes.map(node=>{
      return node.type
    });

    console.log(JSON.stringify(test, null, 2));
  }

  if (parentNodes) {
    parentNodes = parentNodes.filter((node) => {
      return node.type !== "ude";
    });
  }

  parentNodes?.unshift(parentNode);

  const prompt = `
    Context: ${currentRealityTree.context}

    Undesirable Effect (UDE): ${currentUDE}

    ${
      parentNodes
        ? parentNodes
            .reverse()
            .map(
              (node, index) => `
      ${
        index === 0
          ? `Direct cause of UDE`
          : `Intermediate cause of cause above`
      }: ${node.description}`
            )
        : ""
    }

    ${userSuggestion}

  `;

  return prompt;
};

export const renderSystemPrompt = () => {

  const prompt = `
You are a helpful Logical Thinking Process assistant.

We're working on building a Current Reality Tree, which is part of the Logical Thinking Process methodology. The purpose of a Current Reality Tree is to build a logical diagram with an Undesirable effect at the top, then one or more direct and immediate causes leading to it, then again one or more direct and immediate causes leading to those, repeated until a root cause behind each branch of causes has been reached.

Your task is to evaluate the user input and build the cause-effect diagram based on the input. If user inputs a cause, but contributing causes are needed to get to the effect, you should suggest potential contributing causes, making sure those are direct and immediate causes, that you suggest only as many as necessary to achieve the causality.

Throughout this project you should follow strictly the below definitions and rules for verification.

Definitions:
1. Undesirable effect: An undesirable effect is the most prominent indication that something is amiss in a system. It is something that actually exists, and is negative compared with the system’s goal, critical success factors or necessary conditions.

How do we know when we have an undesirable effect?
Are others in the organization or situation likely to agree those effects are negative with respect to the goal, critical success factors and necessary conditions?
If dealing with a social issues, would society at large agree the effects are negative?
Does it constitute an unacceptable deviation from expectations?
Does it affect the success of the system adversely?
Can we verify that it exists?

2. Entity: An entity is a statement that includes a subject, a verb and an object. All premises and conclusions, causes and effects are entities.
3. Premise: A premise is an entity containing a proposition from which a conclusion is drawn.
Conclusion: A conclusion is an entity containing a proposition arrived at based on one or more premises.
4. Cause: A cause is an entity containing a premise.
5. Effect: An effect is an entity containing a conclusion.
An entity can contain a proposition that is at the same time an effect of one or more underlying causes, and the cause, or one of the causes leading to an effect.
6. Contributing cause: A cause that is needed, along with the proposed cause, to ensure the effect or conclusion. A contributing cause is not a cause that leads to the cause it contributes to.

Rules for verification:
Important: You MUST evaluate the direct cause input by the user and check the following:
1. Are the premises and the conclusion likely to be true?
2. Are the premises and the conclusion clearly stated?
3. Are the logical connections between the premises and the conclusion clear?
4. Are the premises sufficient to lead to the conclusion, and if not, what contributing causes are needed?
5. Are there some other potential causes that might lead to the same conclusion?
6. Will the conclusion still be valid if one or more of the premises are removed?
7. Are there any intermediate steps needed for the premises to lead to the conclusion?
8. Is it possible that cause and effect are reversed in the statement?
9. Does the statement express circular logic?

Example:

Context: An IT service company.

Undesirable effect (UDE): The lead time of service requests has increased by 20%

User suggested cause: "Service request wait time has increased by 20%."

Your suggested contributing cause: "Service department capacity has not changed."
In this example, the suggested cause is not enough to unavoidably lead to the effect. The contributing cause is needed also. No other contributing causes are needed. A contributing cause must be immediate and directly leat to the effect, not to another cause. If a direct cause behind  "Service request wait time has increased by 20%" is "The service request review process takes 20% longer" then "Increased complexity of service requests" is not a valid contributing cause, even if it may be a cause for "The service request review process takes 20% longer".

Always output in Markdown format, but skip the \`\`\`markdown. First output the feedback to the user then a JSON, without any explanation afterwards:

Example output:
Your explanation in markdown.

\`\`\`json
{ refinedCauses: string[], refinedAssumptions: string[] }
\`\`\`

If the user is asking for clarification on previous conversation then decide if you want to send more refined direct causes back but you can also send just [] back if needed for the refinedCauses and refinedAssumptions, but only if the user is asking for clarifications.

The first refinedCause and the first assumptions should be what the user suggested, then output a further 2 options for refinedCauses and 2 options for refinedAssumptions.

Each of the refinedCauses and assumptions in the JSON part should never be more than 11 words long and should not end with a period.

Always return refinedCauses and assumptions if the user asks for them even if the user doesn't provide a valid cause him/herself.

In the feedback offer a short paragraph to explain the context of LTP and Current Reality Trees, if relevant.

Please be helpful to the user if he/she is asking for clarifications, the CRT process is sometimes complicated.

If the user asks for variations then use all 3 variations of the user's suggestion for the refinedCauses and refinedAssumptions JSON outputs

Always output the refinedCauses and refinedAssumptions in the JSON not in the markdown part.

We are working down the CRT from the UDE down to the root cause - if direct or intermediate causes are presented in the user message then always focus on the last user suggested cause to the previous cause up the chain.

You must never output ANY text after the JSON part.

You MUST always include the suggestion from the user if viable.
  `;

  return prompt;
};

export const getRefinedCauses = async (
  crt: LtpCurrentRealityTreeData,
  clientId: string,
  wsClients: Map<string, WebSocket>,
  parentNode: LtpCurrentRealityTreeDataNode,
  currentUDE: string,
  chatLog: LtpSimplifiedChatLog[],
  parentNodes: LtpCurrentRealityTreeDataNode[] | undefined = undefined
) => {
  console.log("getRefinedCauses model called");
  console.log(`parentNode: ${JSON.stringify(parentNode, null, 2)}
               currentUDE: ${currentUDE}
               parentNodes: ${JSON.stringify(parentNodes, null, 2)}`)
  let parentNodeType: CrtNodeType;

  if (!parentNode) {
    parentNodeType = "ude";
  } else if (parentNode.type == "ude") {
    parentNodeType = "directCause";
  } else {
    parentNodeType = "intermediateCause";
  }

  console.log(`nodeType: ${parentNodeType}`);

  let messages: any[] = chatLog.map((message: LtpSimplifiedChatLog) => {
    return {
      role: message.sender,
      content: message.message,
    };
  });

  const systemMessage = {
    role: "system",
    content: renderSystemPrompt(),
  };

  messages.unshift(systemMessage);

  if (messages.length === 2) {
    messages[1].content = renderFirstUserPrompt(messages[1].content, crt, parentNode, currentUDE, parentNodes);
  }

  const openai = new OpenAI(config);
  if (DEBUGGING) {
    console.log("=====================");
    console.log(JSON.stringify(messages, null, 2));
    console.log("=====================");
  }
  const stream = await openai.chat.completions.create({
    model: "gpt-4-1106-preview",
    messages,
    max_tokens: 4000,
    temperature: 0.7,
    stream: true,
  });

  if (wsClients.get(clientId)) {
    wsClients
      .get(clientId)
      ?.send(JSON.stringify({ sender: "bot", type: "start" }));
    for await (const part of stream) {
      wsClients.get(clientId)?.send(
        JSON.stringify({
          sender: "bot",
          type: "stream",
          message: part.choices[0].delta.content,
        })
      );
      //console.log(part.choices[0].delta);
    }
    wsClients.get(clientId)?.send(
      JSON.stringify({
        sender: "bot",
        type: "end",
        debug: {
          systemPromptUsedForGeneration: renderSystemPrompt(),
          firstUserMessageUserForGeneration: messages[1].content,
        },
      })
    );
  } else {
    console.error(`WS Client ${clientId} not found`);
    // TODO: Implement this when available
    //stream.cancel();
  }
};
