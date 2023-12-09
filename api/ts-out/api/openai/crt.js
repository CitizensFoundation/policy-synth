import { OpenAI } from "openai";
import { v4 as uuidv4 } from "uuid";
const config = {
    apiKey: process.env.OPENAI_KEY,
};
export const renderSystemPrompt = () => {
    const prompt = `
    You are a helpful Logical Thinking Process assistant. We're working on Current Reality Trees.

    We will work step by step and down the Current Reality Tree, now we are

    Please output up to 7 direct causes of the cause we are examining.

    Please output each direct cause in JSON without any explanation:
      { directCauseDescription, isDirectCause<bool>, isLikelyARootCauseOfUDE<bool>, confidenceLevel<int> }
  `;
    return prompt;
};
export const renderUserPrompt = (currentRealityTree, causeToExmine = undefined, parentNodes = undefined) => {
    return `Context: ${currentRealityTree.context}
          Undesirable Effect: ${currentRealityTree.undesirableEffects}
          Possible Causes: ${currentRealityTree.rawPossibleCauses}

          ${parentNodes
        ? parentNodes.map((node, index) => `
            ${index === 0 ? `Direct` : `Intermediate`} Cause:
            ${node.cause}

          `)
        : ""}

          ${causeToExmine
        ? `
            Cause to Examine: ${causeToExmine.cause}

            Output the possible Direct Causes of the cause we are examining here in JSON:
          `
        : `
            Possible Direct Causes JSON Output:
           `}

          `;
};
export const filterTopCauses = (parsedMessages) => {
    const directCauses = parsedMessages.filter((message) => message.isDirectCause);
    const sortedMessages = directCauses.sort((a, b) => b.confidenceLevel - a.confidenceLevel);
    const top3Messages = sortedMessages.slice(0, 3);
    return top3Messages;
};
export const convertToNodes = (topCauses) => {
    return topCauses.map((cause) => {
        return {
            id: uuidv4(),
            cause: cause.directCauseDescription,
            isRootCause: cause.isLikelyARootCauseOfUDE,
            isLogicValidated: false,
        };
    });
};
export const getParentNodes = (crt, currentparentNode) => {
    [];
    let parentNodes = [];
    let currentNode = currentparentNode;
    while (currentNode) {
        parentNodes.push(currentNode);
        currentNode = crt.nodes.find((node) => {
            return (node.andChildren?.find((child) => child.id === currentNode.id) ||
                node.orChildren?.find((child) => child.id === currentNode.id));
        });
    }
    if (parentNodes.length < 2) {
        parentNodes = undefined;
    }
    else {
        // Slice away the currentparentNode from the parentNodes
        parentNodes = parentNodes.slice(1);
    }
    return parentNodes;
};
export const identifyCauses = async (crt, currentparentNode = undefined) => {
    let parentNodes = undefined;
    if (currentparentNode) {
        parentNodes = getParentNodes(crt, currentparentNode);
    }
    const openai = new OpenAI(config);
    const response = await openai.chat.completions.create({
        model: "gpt-4-1106-preview",
        messages: [
            { role: "system", content: renderSystemPrompt() },
            {
                role: "user",
                content: renderUserPrompt(crt, currentparentNode, parentNodes),
            },
        ],
        max_tokens: 2048,
        temperature: 0.7,
    });
    const parsedMessage = JSON.parse(response.choices[0].message.content);
    const topCauses = filterTopCauses(parsedMessage);
    const nodes = convertToNodes(topCauses);
    return nodes;
};
