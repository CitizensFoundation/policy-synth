import { OpenAI } from "openai";
const DEBUGGING = true;
const config = {
    apiKey: process.env.OPENAI_KEY,
};
export const renderSystemPrompt = (currentRealityTree, parentNode, currentUDE, parentNodes = undefined) => {
    const parentIsUDE = parentNode.type === "ude";
    const prompt = `
    You are a helpful Logical Thinking Process assistant.

    Context: ${currentRealityTree.context}

    Undesirable Effect (UDE): ${currentUDE}

    ${parentNodes
        ? parentNodes.slice(1).reverse().map((node, index) => `
      ${index === 0 ? `Direct cause of UDE` : `Intermediate cause of UDE`}:
      ${node.description}

    `)
        : ""}

    We're working on analysing Current Reality Tree direct and immediate cause.

    The user will submit his idea for a direct and immediate cause for: ${parentNode.description} you will analyze it and give him/her feedback.

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

    Important: You must check the causes and assumptions on each of those points before you output them:
    • 1. Are the premises and the conclusion likely to be true?
    • 2. Are the premises and the conclusion clearly stated?
    • 3. Are the logical connections between the premises and the conclusion clear?
    • 4. Are the premises sufficient to lead to the conclusion, and if not, what additional premises are needed?
    • 5. Are there some other potential causes that might lead to the same conclusion?
    • 6. Will the conclusion still be valid if one or more of the premises are removed?
    • 7. Are there any intermediate steps needed for the premises to lead to the conclusion?
    • 8. Is it possible that cause and effect are reversed in the statement?
    • 9. Does the statement express circular logic?

    Always output in Markdown format, but skip the \`\`\`markdown. First output the feedback to the user then a JSON, without any explanation afterwards:

    Example output:
    <start>
    Your explaination in markdown.

    \`\`\`json
    { refinedCauses: string[], refinedAssumptions: string[] }
    \`\`\`
    <end>

    If the user is asking for clarification on previous conversation then decide if you want to send more refined direct causes back but you can also send just [] back if needed for the refinedCauses and refinedAssumptions, but only if the user is asking for clarifications.

    The first refinedCause and the first assumptions should be what the user suggested, then output a further 2 options for refinedCauses and 2 options for refinedAssumptions.

    Each of the refinedCauses and assumptions in the JSON part should never be more than 11 words long and should not end with a period.

    Always return refinedCauses and assumptions if the user asks for them even if the user doesn't provide a valid cause him/herself.

    In the feedback offer a short paragraph to explain the context of LTP and Current Reality Trees, if relevant.

    Please be helpful to the user if he/she is asking for clarifications, the CRT process is sometimes complicated.

    If the user asks for variations then use all 3 variations of the user's suggestion for the refinedCauses and refinedAssumptions JSON outputs

    Always output the refinedCauses and refinedAssumptions in the JSON not in the markdown part.

    You must never output ANY text after the JSON part.

    You MUST always include the suggestion from the user if viable.
  `;
    return prompt;
};
export const getRefinedCauses = async (crt, clientId, wsClients, parentNode, currentUDE, chatLog, parentNodes = undefined) => {
    console.log("getRefinedCauses model called");
    let nodeType;
    if (!parentNode) {
        nodeType = "ude";
    }
    else if (parentNode.type == "ude") {
        nodeType = "directCause";
    }
    else {
        nodeType = "intermediateCause";
    }
    let messages = chatLog.map((message) => {
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
    const stream = await openai.chat.completions.create({
        model: "gpt-4-1106-preview",
        messages,
        max_tokens: 4000,
        temperature: 0.7,
        stream: true
    });
    if (wsClients.get(clientId)) {
        wsClients.get(clientId)?.send(JSON.stringify({ sender: 'bot', type: "start" }));
        for await (const part of stream) {
            wsClients.get(clientId)?.send(JSON.stringify({ sender: 'bot', type: "stream", message: part.choices[0].delta.content }));
            console.log(part.choices[0].delta);
        }
        wsClients.get(clientId)?.send(JSON.stringify({ sender: 'bot', type: "end", debug: {
                systemPromptUsedForGeneration: renderSystemPrompt(crt, parentNode, currentUDE, parentNodes),
                firstUserMessageUserForGeneration: messages[1].content
            } }));
    }
    else {
        console.error(`WS Client ${clientId} not found`);
        // TODO: Implement this when available
        //stream.cancel();
    }
};
