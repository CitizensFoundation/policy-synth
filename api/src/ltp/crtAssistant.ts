import { OpenAI } from "openai";
import { Stream } from "openai/streaming.mjs";
import { hrtime } from "process";
import { v4 as uuidv4 } from "uuid";
import WebSocket from "ws";

const DEBUGGING = true;

const config = {
  apiKey: process.env.OPENAI_KEY,
};

const contextReplaceToken = "!!!replaceCONTEXTreplace!!!";
const simpleTreeReplaceToken = "!!!replaceSIMPLIFIED_TREEreplace!!!";

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

export const renderSystemPrompt = () => {
  const prompt = `You're helping to create a Current Reality Tree, a tool in Logical Thinking Process methodology. Here's a simplified guide:

  1. You'll get the entire conversation history for context.
  2. If asked for clarification, you can refine causes or send an empty response.
  3. Always offer suggested causes, even if the user's causes aren’t valid.
  4. Be helpful; the CRT process can be complex.
  5. Reflect any validation errors in your output without showing them to the user.
  6. Include the user's suggestion if it's viable.
  7. Use causes from the Logic Validation if it says "isValid: true".
  8. If there are validation errors, provide step-by-step solutions, keeping the user informed.

  When creating new causes:

  1. Avoid causality in causes.
  2. Causes should only have elements from the effect.
  3. If multiple causes, they must be connected.
  4. Causes together must lead to the effect.
  5. Always include previously validated causes.
  6. Don’t suggest causes already in the working tree. Use the tree to guide your suggestions.
  7. Suggested causes shouldn’t exceed 11 words and avoid ending with a period.
  8. Start with 1-3 suggested causes, as many ase are needed, adding more as the list grows. Keep user's confirmed causes at the top.
  9. Include the user’s submitted cause, even if not perfect.
  10. Always present suggested causes in JSON format, even if previously discussed.

  Provide explanations in markdown format, followed by JSON format.
\`\`\`json
{ suggestedCauses: string[] }
\`\`\`

You must never output ANY text after the JSON part.

`;

  return prompt;
};

let simplifiedIdMap: Record<string, number> = {};
let simplifiedIdCounter = 0;

const getSimplifiedId = (originalId: string) => {
  if (!simplifiedIdMap[originalId]) {
    simplifiedIdCounter += 1;
    simplifiedIdMap[originalId] = simplifiedIdCounter;
  }
  return simplifiedIdMap[originalId];
};

const simplifyTree = (
  node: LtpCurrentRealityTreeDataNode,
  crtNodeId: string
) => {
  if (!node) return null;

  // Check if the current node is the one we're working with
  const isCurrentlyLookingForCausesToThisEffect = node.id === crtNodeId;

  const causes = node.children
    ? node.children.map((child) => simplifyTree(child, crtNodeId))
    : [];

  let simplifiedNode = {
    id: getSimplifiedId(node.id),
    effect: node.description,
    causes: causes,
  } as LtpCrtSimplifiedForAI;

  if (isCurrentlyLookingForCausesToThisEffect === true) {
    simplifiedNode.isCurrentlyLookingForCausesToThisEffect = true;
  }

  return simplifiedNode;
};

const streamWebSocketResponses = async (
  messages: any,
  //@ts-ignore
  stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>,
  clientId: string,
  wsClients: Map<string, WebSocket>,
  systemPrompt: string
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
        systemPromptUsedForGeneration: systemPrompt,
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
  chatLog: PsSimpleChatLog[],
  parentNodes: LtpCurrentRealityTreeDataNode[] | undefined = undefined,
  customSystemPrompts: Map<number, string> | undefined = undefined,
  effect?: string,
  causes?: string[],
  validationReview?: string
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
    parentNodeType = "directCause";
  }

  console.log(`nodeType: ${parentNodeType}`);

  let messages: any[] = chatLog.map((message: PsSimpleChatLog) => {
    return {
      role: message.sender,
      content: message.message,
    };
  });

  let systemPrompt;

  if (
    customSystemPrompts &&
    customSystemPrompts.has(7) &&
    customSystemPrompts.get(7) != ""
  ) {
    systemPrompt = customSystemPrompts.get(7);
  } else {
    systemPrompt = renderSystemPrompt();
  }

  const simplifiedTreeText = `The whole working tree: ${JSON.stringify(
    crt.nodes.map((node) => simplifyTree(node, parentNode.id)),
    null,
    2
  )}`;

  systemPrompt = systemPrompt!.replace(contextReplaceToken, crt.context);

  systemPrompt = systemPrompt!.replace(
    simpleTreeReplaceToken,
    simplifiedTreeText
  );

  const systemMessage = {
    role: "system",
    content: systemPrompt,
  };

  messages.unshift(systemMessage);

  if (messages.length === 2) {
    if (effect && causes && validationReview) {
      messages[1].content = renderFirstUserPrompt(
        effect,
        causes,
        validationReview
      );
    } else {
      console.error(
        "effect, causes and validationReview are required for first user message"
      );
      return;
    }
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
    streamWebSocketResponses(
      messages,
      stream,
      clientId,
      wsClients,
      systemPrompt!
    );
  } else {
    console.error(`WS Client ${clientId} not found`);
    // TODO: Implement this when available
    //stream.cancel();
  }
};
