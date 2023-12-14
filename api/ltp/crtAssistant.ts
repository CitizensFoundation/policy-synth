import { OpenAI } from "openai";
import { hrtime } from "process";
import { v4 as uuidv4 } from "uuid";

const DEBUGGING = true;

const config = {
  apiKey: process.env.OPENAI_KEY,
};

export const renderSystemPrompt = (
  currentRealityTree: LtpCurrentRealityTreeData,
  parentNode: LtpCurrentRealityTreeDataNode,
  currentUDE: string,
  parentNodes: LtpCurrentRealityTreeDataNode[] | undefined = undefined
) => {

  const parentIsUDE = parentNode.type === "ude";

  const prompt = `
    You are a helpful Logical Thinking Process assistant.

    Context: ${currentRealityTree.context}

    Undesirable Effect (UDE): ${currentUDE}

    ${
      parentNodes
        ? parentNodes.slice(1).reverse().map(
            (node, index) => `
      ${
        index === 0 ? `Direct cause of UDE` : `Intermediate cause of UDE`
      }:
      ${node.description}

    `
          )
        : ""
    }

    We're working on analysing Current Reality Tree direct cause and immediate for this ${parentIsUDE ? 'UDE' : 'cause'}: ${parentNode.description}

    The user will submit his idea for a direct cause to: ${parentNode.description} you will analyze it and give him feedback.

    You have access to the whole chat history of the user.
    Definitions

    Undesirable effect
    An undesirable effect is the most prominent indication that something is amiss in a system. It is something that actually exists, and is negative compared with the system’s goal, critical success factors or necessary conditions.

    How do we know when we have an undesirable effect?
    Are others in the organization or situation likely to agree those effects are negative with respect to the goal, critical success factors and necessary conditions?
    If dealing with a social issues, would society at large agree the effects are negative?
    Does it constitute an unacceptable deviation from expectations?
    Does it affect the success of the system adversely?
    Can we verify that it exists?

    Entity: An entity is a statement that includes a subject, a verb and an object. All premises and conclusions, causes and effects are entities.
    Premise: A premise is an entity containing a proposition from which a conclusion is drawn.
    Conclusion: A conclusion is an entity containing a proposition arrived at based on one or more premises.
    Cause: A cause is an entity containing a premise.
    Effect: An effect is an entity containing a conclusion.
    An entity can contain a proposition that is at the same time an effect of one or more underlying causes, and the cause, or one of the causes leading to an effect.
    Assumption: An assumption is an entity containing a premise that does not actively contribute to an effect, but that must be in place for the active cause to lead to the change.

    Important: You must check the direct causes on each of those points before you output them and check the following:
    • 1. Are the premises and the conclusion likely to be true?
    • 2. Are the premises and the conclusion clearly stated?
    • 3. Are the logical connections between the premises and the conclusion clear?
    • 4. Are the premises sufficient to lead to the conclusion, and if not, what additional premises are needed?
    • 5. Are there some other potential causes that might lead to the same conclusion?
    • 6. Will the conclusion still be valid if one or more of the premises are removed?
    • 7. Are there any intermediate steps needed for the premises to lead to the conclusion?
    • 8. Is it possible that cause and effect are reversed in the statement?
    • 9. Does the statement express circular logic?

    In addition to refining the users direct cause, if it is viable at all, you will also return a total of 3 direct causes for: ${parentNode.description}, including the users refined direct cause, if it is viable.

    If the user is asking for clarification on previous conversation then decide if you want to send more refined direct causes back but you can also send just [] back if needed for the refinedCauses, but only if the user is asking for clarifications.

    Please output JSON without any explanation:
      { feedback: string, refinedCauses: string[] }

    Each of the refinedCauses JSON should never be more than 11 words long and should not end with a period.

    Always return refinedCauses if the user asks for them even if the user doesn't provide a valid cause him/herself.

    In the feedback offer a short paragraph to explain the context of LTP and Current Reality Trees, if relevant.

    You can use markdown to format the feedback in a single line, but not the refinedCauses. The feedback should always be output as string.

    Please be helpful to the user if he/she is asking for clarifications, the CRT process is sometimes complicated.

    If the user proposes one of his/her own then always include that in your list of returned refinedCauses, if viable.

    You must never offer explainations outside the JSON, only output JSON.
  `;

  return prompt;
};

export const getRefinedCauses = async (
  crt: LtpCurrentRealityTreeData,
  parentNode: LtpCurrentRealityTreeDataNode,
  currentUDE: string,
  chatLog: LtpSimplifiedChatLog[],
  parentNodes: LtpCurrentRealityTreeDataNode[] | undefined = undefined
) => {
  let nodeType: CrtNodeType;

  if (!parentNode) {
    nodeType = "ude"
  } else if (parentNode.type=="ude") {
    nodeType = "directCause";
  } else {
    nodeType = "intermediateCause";
  }

  let messages: any[] = chatLog.map((message: LtpSimplifiedChatLog) => {
    return {
      role: message.sender,
      content: message.message,
    };
  });

  const systemMessage = {
    role: "system",
    content: renderSystemPrompt(crt, parentNode, currentUDE, parentNodes),
  };

  messages.unshift(systemMessage);

  const openai = new OpenAI(config);
  if (DEBUGGING) {
    console.log("DEBUGGING: crt", JSON.stringify(crt, null, 2));
    console.log("=====================");
    console.log(renderSystemPrompt(crt, parentNode, currentUDE, parentNodes));
    console.log("---------------------");
    console.log(JSON.stringify(messages, null, 2));
    console.log("=====================");
  }
  const response = await openai.chat.completions.create({
    model: "gpt-4-1106-preview",
    messages,
    max_tokens: 4000,
    temperature: 0.7,
  });

  let rawMessage = response.choices[0].message.content!;
  if (DEBUGGING) {
    console.log("DEBUGGING: rawMessage", rawMessage);
  }
  rawMessage = rawMessage.trim().replace(/```json/g, "");
  rawMessage = rawMessage.replace(/```/g, "");
  const parsedMessage: CrtRefinedCausesReply = JSON.parse(rawMessage);

  if (DEBUGGING) {
    console.log(
      "DEBUGGING: parsedMessage",
      JSON.stringify(parsedMessage, null, 2)
    );
  }

  let returnMessage: LtpChatBotCrtMessage = {
    message: parsedMessage.feedback,
    rawMessage: rawMessage,
    refinedCausesSuggestions: parsedMessage.refinedCauses,
  };

  if (DEBUGGING) {
    returnMessage = {...returnMessage, ...{
      debug: {
        systemPromptUsedForGeneration: renderSystemPrompt(crt, parentNode, currentUDE, parentNodes),
        firstUserMessageUserForGeneration: messages[1].content
      }
    }}

    console.log(
      "DEBUGGING: final nodes",
      JSON.stringify(returnMessage, null, 2)
    );
  }
  return returnMessage;
};
