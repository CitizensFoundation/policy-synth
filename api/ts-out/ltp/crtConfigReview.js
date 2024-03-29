import { OpenAI } from "openai";
const DEBUGGING = true;
const config = {
    apiKey: process.env.OPENAI_KEY,
};
export const renderUserPrompt = (crt) => {
    const prompt = `
    Context to review : ${crt.context}

    Undesirable Effects (UDE) to review: ${crt.undesirableEffects.join(", ")}

    Take a deep breath, think step by step and output your review in rich markdown format:
    `;
    return prompt;
};
export const renderSystemPrompt = () => {
    const prompt = `You are a helpful Logical Thinking Process assistant.

  We're working on building a Current Reality Tree and now at first setting up a context and Undesirable Effects (UDE).

  You should review those careful and give the user helpful feedback based on your extensive knowledge of the Logical Thinking Process.

  Please output in rich markdown format but be concise and to the point.

  If the user doesn't know what is going on includes placeholder text give give him/her a full explanation with concise examples.
`;
    return prompt;
};
export const getConfigurationReview = async (crt, clientId, wsClients) => {
    const messages = [
        {
            role: "system",
            content: renderSystemPrompt(),
        },
        {
            role: "user",
            content: renderUserPrompt(crt),
        },
    ];
    const openai = new OpenAI(config);
    if (DEBUGGING) {
        console.log("DEBUGGING: crt", JSON.stringify(crt, null, 2));
        console.log("=====================");
        console.log(renderSystemPrompt());
        console.log("---------------------");
        console.log(renderUserPrompt(crt));
        console.log("=====================");
    }
    const stream = await openai.chat.completions.create({
        model: "gpt-4-1106-preview",
        messages,
        max_tokens: 2048,
        temperature: 0.4,
        stream: true
    });
    if (wsClients.get(clientId)) {
        for await (const part of stream) {
            wsClients.get(clientId)?.send(JSON.stringify({ type: "part", text: part.choices[0].delta.content }));
            //console.log(part.choices[0].delta);
        }
        wsClients.get(clientId)?.send(JSON.stringify({ type: "end" }));
    }
    else {
        console.error(`WS Client ${clientId} not found`);
        // TODO: Implement this when available
        //stream.cancel();
    }
};
//# sourceMappingURL=crtConfigReview.js.map