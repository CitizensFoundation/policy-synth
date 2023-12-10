import { OpenAI } from "openai";
import { hrtime } from "process";
import { v4 as uuidv4 } from "uuid";

const DEBUGGING = true;

const config = {
  apiKey: process.env.OPENAI_KEY,
};

export const renderSystemPrompt = (causeToExmine: LtpCurrentRealityTreeDataNode | undefined = undefined) => {
  const prompt = `
    You are a helpful Logical Thinking Process assistant. We're working on a Current Reality Tree.

    We will work step by step and down the Current Reality Tree until we find the root cause of the "Undesireable Effect".

    A root cause is the fundamental, underlying reason for a problem or issue within a system or process. It's the deepest cause in a chain of causes-and-effects that leads to an issue, and resolving it typically prevents the problem from recurring.

    ${ causeToExmine!=undefined ? `
      Please output 7 direct causes of the cause we are examining.
    `: `
      Please output 7 direct causes of the "Undesireable Effect" and analyse the "Possible Raw Unclassified Causes" for ideas. It's unlikely those will be the actual root caues.
    `}

    Please output each direct cause in JSON without any explanation:
      { directCauseDescription, isDirectCause<bool>, isLikelyARootCauseOfUDE<bool>, confidenceLevel<int> }
  `;

  return prompt;
};

export const renderUserPrompt = (
  currentRealityTree: LtpCurrentRealityTreeData,
  causeToExmine: LtpCurrentRealityTreeDataNode | undefined = undefined,
  parentNodes: LtpCurrentRealityTreeDataNode[] | undefined = undefined
) => {
  return `Context: ${currentRealityTree.context}
          Undesirable Effect: ${currentRealityTree.undesirableEffects[0]}
          Possible Raw Unclassified Causes: ${currentRealityTree.rawPossibleCauses || "None found, please figure it out yourself."}

          ${
            parentNodes
              ? parentNodes.reverse().map(
                  (node, index) => `
            ${index === 0 ? `Direct cause of UDE` : `Intermediate cause of UDE`} Cause:
            ${node.cause}

          `
                )
              : ""
          }

          ${
            causeToExmine
              ? `
            Cause to Examine: ${causeToExmine.cause}

            Output the possible Direct Causes of the cause we are examining here in JSON:
          `
              : `
            Possible Direct Causes JSON Output:
           `
          }

          `;
};

export const filterTopCauses = (
  parsedMessages: CrtPromptJson[]
): CrtPromptJson[] => {
  const directCauses = parsedMessages.filter(
    (message) => message.isDirectCause
  );
  const sortedMessages = directCauses.sort(
    (a, b) => b.confidenceLevel - a.confidenceLevel
  );
  const top3Messages = sortedMessages.slice(0, 3);
  return top3Messages;
};

export const convertToNodes = (
  topCauses: CrtPromptJson[]
): LtpCurrentRealityTreeDataNode[] => {
  return topCauses.map((cause) => {
    return {
      id: uuidv4(),
      cause: cause.directCauseDescription,
      isRootCause: cause.isLikelyARootCauseOfUDE,
      isLogicValidated: false,
    };
  });
};

export const getParentNodes = (
  nodes: LtpCurrentRealityTreeDataNode[], // Pass in crt.nodes here
  currentNodeId: string,
  parentNodes: LtpCurrentRealityTreeDataNode[] = []
): LtpCurrentRealityTreeDataNode[] | undefined => {

  for (const node of nodes) {
    // Check if the current node is a direct child of this node
    const isDirectChild = node.andChildren?.some((child: LtpCurrentRealityTreeDataNode) => child.id === currentNodeId) ||
                          node.orChildren?.some((child: LtpCurrentRealityTreeDataNode) => child.id === currentNodeId);

    if (isDirectChild) {
      parentNodes.push(node);
      // Call recursively with the parent node's ID
      return getParentNodes(nodes, node.id, parentNodes);
    }

    // Recursively check in andChildren and orChildren
    const andChildrenResult = node.andChildren ? getParentNodes(node.andChildren, currentNodeId, parentNodes) : undefined;
    const orChildrenResult = node.orChildren ? getParentNodes(node.orChildren, currentNodeId, parentNodes) : undefined;

    if (andChildrenResult || orChildrenResult) {
      // If either returns a result, we found the parent node
      if (!parentNodes.includes(node)) {
        parentNodes.push(node);
      }
      return parentNodes;
    }
  }

  return parentNodes.length === 0 ? undefined : parentNodes;
};

export const identifyCauses = async (
  crt: LtpCurrentRealityTreeData,
  currentparentNode: LtpCurrentRealityTreeDataNode | undefined = undefined
) => {
  let parentNodes: LtpCurrentRealityTreeDataNode[] | undefined = undefined;

  if (currentparentNode) {
    parentNodes = getParentNodes(crt.nodes, currentparentNode.id);
  }

  const openai = new OpenAI(config);
  if (DEBUGGING) {
    console.log("DEBGUGGING: currentparentNode", JSON.stringify(currentparentNode, null, 2));
    console.log("DEBGUGGING: parentNodes", JSON.stringify(parentNodes, null, 2));
    console.log("DEBUGGING: crt", JSON.stringify(crt, null, 2));
    console.log("=====================")
    console.log(renderSystemPrompt(currentparentNode))
    console.log("---------------------")
    console.log(renderUserPrompt(crt, currentparentNode, parentNodes))
    console.log("=====================")
  }
  const response = await openai.chat.completions.create({
    model: "gpt-4-1106-preview",
    messages: [
      { role: "system", content: renderSystemPrompt(currentparentNode) },
      {
        role: "user",
        content: renderUserPrompt(crt, currentparentNode, parentNodes),
      },
    ],
    max_tokens: 2048,
    temperature: 0.7,
  });

  let rawMessage = response.choices[0].message.content!;
  if (DEBUGGING) {
    console.log("DEBUGGING: rawMessage", rawMessage);
  }
  rawMessage = rawMessage.trim().replace(/```json/g, "");
  rawMessage = rawMessage.replace(/```/g, "");
  const parsedMessage: CrtPromptJson[] = JSON.parse(rawMessage);

  if (DEBUGGING) {
    console.log("DEBUGGING: parsedMessage", JSON.stringify(parsedMessage, null, 2));
  }

  const topCauses = filterTopCauses(parsedMessage);
  const nodes = convertToNodes(topCauses);

  if (DEBUGGING) {
    console.log("DEBUGGING: final nodes", JSON.stringify(nodes, null, 2));
  }
  return nodes;
};
