import { OpenAI } from "openai";
import { hrtime } from "process";
import { v4 as uuidv4 } from "uuid";

const DEBUGGING = true;

const config = {
  apiKey: process.env.OPENAI_KEY,
};

export const renderSystemPrompt = (
  causeToExmine: LtpCurrentRealityTreeDataNode | undefined = undefined,
  parentNodes: LtpCurrentRealityTreeDataNode[] | undefined = undefined
) => {
  const prompt = `
    You are a helpful Logical Thinking Process assistant. We're working on a Current Reality Tree.

    We will work step by step and down the Current Reality Tree until we find the root cause of the "Undesireable Effect".

    ${
      causeToExmine != undefined
        ? `
      Please output 7 direct causes of the cause presented in the "Cause to Examine" below. The causes must be direct causes of the "Cause to Examine" not results of it.
    `
        : `
      Please output 7 direct causes of the "Undesireable Effect" and analyse the "Possible Raw Unclassified Causes" for ideas.
    `
    }

    Important: You MUST evaluate the 7 direct causes before you output them and check the following:
    • 1. Are the premises and the conclusion stated as whole sentences, that is, containing subject, verb and object?
    • 2. Are the premises and the conclusion likely to be true?
    • 3. Are the premises and the conclusion clearly stated?
    • 4. Are the logical connections between the premises and the conclusion clear?
    • 5. Are the premises sufficient to lead to the conclusion, and if not, what additional premises are needed?
    • 6. Are there some other potential causes that might lead to the same conclusion?
    • 7. Will the conclusion still be valid if one or more of the premises are removed?
    • 8. Are there any intermediate steps needed for the premises to lead to the conclusion?
    • 9. Is it possible that cause and effect are reversed in the statement?
    • 10. Does the statement express circular logic?

    Please output each direct cause in JSON without any explanation:
      { directCauseDescription, isDirectCause<bool>, isLikelyARootCauseOfUDE<bool>, confidenceLevel<int> }

    The directCauseDescription JSON should never be more than 11 words long.

    ${
      parentNodes != undefined
        ? `Direct and possible intermediate causes of the "Cause to Examine" are included below for your reference but you still need to focus your creation of direct causes on the "Cause to Examine" only.`
        : ``
    }

    ${
      causeToExmine != undefined
        ? `
    For the isDirectCause JSON field, please output true if the cause we are examining is a direct cause of the "Cause to Examine", otherwise output false.

    For the isLikelyARootCauseOfUDE JSON field, please output true if "Cause to Examine" is likely the root cause of the "Undesireable Effect (UDE)", otherwise output false.
    `
        : `
    Always keep the isLikelyARootCauseOfUDE to false for now as this is the first level of direct causes.
  `
    }

    You must never offer explainations, only output JSON array.
  `;

  return prompt;
};

export const renderUserPrompt = (
  currentRealityTree: LtpCurrentRealityTreeData,
  currentUDE: string,
  causeToExmine: LtpCurrentRealityTreeDataNode | undefined = undefined,
  parentNodes: LtpCurrentRealityTreeDataNode[] | undefined = undefined
) => {
  // add all but the first node to selectedParentNodes

  return `Context: ${currentRealityTree.context}
          Undesirable Effect (UDE): ${currentUDE}

          ${
            parentNodes && parentNodes.length > 1
              ? `
            Chain of causes leading to the root cause we are searching for step by step:
          `
              : ``
          }

          ${
            parentNodes
              ? parentNodes
                  .slice(1)
                  .reverse()
                  .map(
                    (node, index) => `
            ${
              index === 0 ? `Direct cause of UDE` : `Intermediate cause of UDE`
            }:
            ${node.description}

          `
                  )
              : ""
          }

          ${
            causeToExmine
              ? `
            Cause to Examine: ${causeToExmine.description}

            Output the possible Direct Causes of the cause we are examining here in JSON:
          `
              : `
            Possible Direct Causes JSON Array Output:
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
  topCauses: CrtPromptJson[],
  nodeType: CrtNodeType,
  debug: CrtDebugData | undefined = undefined
): LtpCurrentRealityTreeDataNode[] => {
  return topCauses.map((cause) => {
    return {
      id: uuidv4(),
      description: cause.directCauseDescription,
      type: nodeType,
      isRootCause: cause.isLikelyARootCauseOfUDE,
      isLogicValidated: false,
      debug,
    } as LtpCurrentRealityTreeDataNode;
  });
};

export const getParentNodes = (
  nodes: LtpCurrentRealityTreeDataNode[], // Pass in crt.nodes here
  currentNodeId: string,
  parentNodes: LtpCurrentRealityTreeDataNode[] = []
): LtpCurrentRealityTreeDataNode[] | undefined => {
  for (const node of nodes) {
    // Check if the current node is a direct child of this node
    const isDirectChild =
      node.children?.some(
        (child: LtpCurrentRealityTreeDataNode) => child.id === currentNodeId
      )

    if (isDirectChild) {
      parentNodes.push(node);
      // Call recursively with the parent node's ID
      return getParentNodes(nodes, node.id, parentNodes);
    }

    // Recursively check in children children
    const childrenResult = node.children
      ? getParentNodes(node.children, currentNodeId, parentNodes)
      : undefined;

    if (childrenResult) {
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
  currentUDE: string,
  currentparentNode: LtpCurrentRealityTreeDataNode | undefined = undefined
) => {
  let parentNodes: LtpCurrentRealityTreeDataNode[] | undefined = undefined;

  if (currentparentNode) {
    parentNodes = getParentNodes(crt.nodes, currentparentNode.id);
  }

  let nodeType: CrtNodeType;

  if (!currentparentNode) {
    nodeType = "ude";
  } else if (currentparentNode.type == "ude") {
    nodeType = "directCause";
  } else {
    nodeType = "directCause";
  }

  const openai = new OpenAI(config);

  if (DEBUGGING) {
    console.log(
      "DEBGUGGING: currentparentNode",
      JSON.stringify(currentparentNode, null, 2)
    );
    console.log(
      "DEBGUGGING: parentNodes",
      JSON.stringify(parentNodes, null, 2)
    );
    console.log("DEBUGGING: crt", JSON.stringify(crt, null, 2));
    console.log("=====================");
    console.log(renderSystemPrompt(currentparentNode, parentNodes));
    console.log("---------------------");
    console.log(
      renderUserPrompt(crt, currentUDE, currentparentNode, parentNodes)
    );
    console.log("=====================");
  }
  const response = await openai.chat.completions.create({
    model: "gpt-4-1106-preview",
    messages: [
      {
        role: "system",
        content: renderSystemPrompt(currentparentNode, parentNodes),
      },
      {
        role: "user",
        content: renderUserPrompt(
          crt,
          currentUDE,
          currentparentNode,
          parentNodes
        ),
      },
    ],
    max_tokens: 2048,
    temperature: 0.5,
  });

  let rawMessage = response.choices[0].message.content!;
  if (DEBUGGING) {
    console.log("DEBUGGING: rawMessage", rawMessage);
  }
  rawMessage = rawMessage.trim().replace(/```json/g, "");
  rawMessage = rawMessage.replace(/```/g, "");
  const parsedMessage: CrtPromptJson[] = JSON.parse(rawMessage);

  if (DEBUGGING) {
    console.log(
      "DEBUGGING: parsedMessage",
      JSON.stringify(parsedMessage, null, 2)
    );
  }

  const topCauses = filterTopCauses(parsedMessage);
  let debug: CrtDebugData | undefined = undefined;

  if (DEBUGGING) {
    debug = {
      systemPromptUsedForGeneration: renderSystemPrompt(
        currentparentNode,
        parentNodes
      ),
      firstUserMessageUserForGeneration: renderUserPrompt(
        crt,
        currentUDE,
        currentparentNode,
        parentNodes
      ),
    };
  }

  const nodes = convertToNodes(topCauses, nodeType, debug);

  if (DEBUGGING) {
    console.log("DEBUGGING: final nodes", JSON.stringify(nodes, null, 2));
  }
  return nodes;
};
