import { OpenAI } from "openai";
import { Stream } from "openai/streaming.mjs";
import { hrtime } from "process";
import { v4 as uuidv4 } from "uuid";
import WebSocket from "ws";

const DEBUGGING = true;

const config = {
  apiKey: process.env.OPENAI_KEY,
};

export const renderFirstUserPromptWithTree = (
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
    userSuggestion =
      "User suggested intermediate or root cause of the cause above: ";
  }

  userSuggestion += currentUserMessage;

  if (parentNodes) {
    const test = parentNodes.map((node) => {
      return node.type;
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
        ? parentNodes.reverse().map(
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

export const renderFirstUserPrompt = (
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

export const renderSystemPrompt = (isFirstMessage: boolean) => {
  const prompt = `You are a helpful Logical Thinking Process expert.

###Context###
We're working on building a Current Reality Tree, which is part of the Logical Thinking Process methodology.

The user has entered an effect and one or more causes leading to it. We've then used a GPT4 based validation chain with multiple GPT4 prompts to validate the logic of the user's input in detail, use this to validate your feedback and generations.

${
  !isFirstMessage
    ? "You are provided with the whole message history to inform you of the conversation so far."
    : ""
}

###Instructions###
If the user is asking for clarification on previous conversation then decide if you want to send more refined causes back but you can also send just [] back if needed for the suggestedCauses and suggestedAssumptions.

Each of the suggestedCauses and assumptions in the JSON part should never be more than 11 words long and should not end with a period. Output up to 3 suggestedCauses, but as few as are needed to be sufficient to lead directly to the effect

Always return suggestedCauses and assumptions if the user asks for them even if the user doesn't provide a valid cause him/herself.

In the feedback offer a short paragraph to explain the context of LTP and Current Reality Trees,.

Please be helpful to the user if he/she is asking for clarifications, the CRT process is sometimes complicated.

The actual end user will not see the validationErrors provided, if any, so make sure to reflect that in your output.

You MUST always include the suggestion from the user if viable.

If the results of the Logic Validation isValid: true then always use exactly those causes and connected assumptions in the JSON part.

If there are validationErrors in the Logic Validation then try to come up with solutions in the most helpful and step by step way and keep the user in the loop.

###General rules for cause generation###
When you create new options for causes, use your extensive knowledge of logic, the logical thinking process, in addition to those rules:
1. No cause should contain causality.
2. The cause should only contain subjects and predicates included in the effect.
3. If more than one cause then those need to be laterally connected.
4. The causes together should be sufficient to lead directly to the effect.

###Output###
Think step by step and provide a detailed explanation in markdown format.

Then JSON:

\`\`\`json
{ suggestedCauses: string[], suggestedAssumptions: string[] }
\`\`\`

You must never output ANY text after the JSON part.

`;

  return prompt;
};

const streamWebSocketResponses = async (
  messages: any,
  stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>,
  clientId: string,
  wsClients: Map<string, WebSocket>
) => {
  const wsClient = wsClients.get(clientId);
  if (!wsClient) {
    console.error(
      `WS Client ${clientId} not found in streamWebSocketResponses`
    );
    return;
  }

  wsClient.send(JSON.stringify({ sender: "bot", type: "start" }));
  for await (const part of stream) {
    wsClient.send(
      JSON.stringify({
        sender: "bot",
        type: "stream",
        message: part.choices[0].delta.content,
      })
    );
    //console.log(part.choices[0].delta);
  }
  wsClient.send(
    JSON.stringify({
      sender: "bot",
      type: "end",
      debug: {
        systemPromptUsedForGeneration: renderSystemPrompt(
          messages.length === 2
        ),
        firstUserMessageUserForGeneration: messages[1].content,
      },
    })
  );
};

export const getRefinedCauses = async (
  crt: LtpCurrentRealityTreeData,
  clientId: string,
  wsClients: Map<string, WebSocket>,
  parentNode: LtpCurrentRealityTreeDataNode,
  currentUDE: string,
  chatLog: LtpSimplifiedChatLog[],
  parentNodes: LtpCurrentRealityTreeDataNode[] | undefined = undefined,
  effect: string,
  causes: string[],
  validationReview: string
) => {
  console.log("getRefinedCauses model called");
  console.log(`parentNode: ${JSON.stringify(parentNode, null, 2)}
               currentUDE: ${currentUDE}
               parentNodes: ${JSON.stringify(parentNodes, null, 2)}`);
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
    content: renderSystemPrompt(messages.length === 2),
  };

  messages.unshift(systemMessage);

  if (messages.length === 2) {
    messages[1].content = renderFirstUserPrompt(
      effect,
      causes,
      validationReview
    );
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
    streamWebSocketResponses(messages, stream, clientId, wsClients);
  } else {
    console.error(`WS Client ${clientId} not found`);
    // TODO: Implement this when available
    //stream.cancel();
  }
};
