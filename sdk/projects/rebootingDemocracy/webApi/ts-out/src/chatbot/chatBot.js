import { PsBaseChatBot } from "@policysynth/api/base/chat/baseChatBot.js";
import { PsRagRouter } from "./router.js";
import { PsRagVectorSearch } from "./vectorSearch.js";
export class RebootingDemocracyChatBot extends PsBaseChatBot {
    persistMemory = true;
    mainSreamingSystemPrompt = `You are the Rebooting Democracy chatbot a friendly AI that helps users find information from a large database of documents.

Instructions:
- The user will ask a question, we will search a large database in a vector store and bring information connected to the user question into your <CONTEXT_TO_ANSWER_USERS_QUESTION_FROM> to provide a thoughtful answer from.
- If not enough information is available, you can ask the user for more information.
- Never provide information that is not backed by your context or is common knowledge.
- Look carefully at all in your context before you present the information to the user.
- Be optimistic and cheerful but keep a professional nordic style of voice.
- Do not reference your contexts and the different document sources just provide the information based on those sources.
- For all document sources we will provide the user with those you do not need to link or reference them.
- If there are inline links in the actual document chunks, you can provide those to the user in a markdown link format.
- Use markdown to format your answers, always use formatting so the response comes alive to the user.
- Keep your answers short and to the point except when the user asks for detail.
`;
    mainStreamingUserPrompt = (latestQuestion, context) => `<LATEST_USER_QUESTION>
${latestQuestion}</LATEST_USER_QUESTION>

<CONTEXT_TO_ANSWER_USERS_QUESTION_FROM>
${context}
</CONTEXT_TO_ANSWER_USERS_QUESTION_FROM>

Your thoughtful answer in markdown:
`;
    rebootingDemocracyConversation = async (chatLog, dataLayout) => {
        this.setChatLog(chatLog);
        const userLastMessage = chatLog[chatLog.length - 1].message;
        console.log(`userLastMessage: ${userLastMessage}`);
        const chatLogWithoutLastUserMessage = chatLog.slice(0, -1);
        console.log(`chatLogWithoutLastUserMessage: ${JSON.stringify(chatLogWithoutLastUserMessage, null, 2)}`);
        this.sendAgentStart("Thinking...");
        const router = new PsRagRouter();
        const routingData = await router.getRoutingData(userLastMessage, dataLayout, JSON.stringify(chatLogWithoutLastUserMessage));
        this.sendAgentStart("Searching Rebooting Democracy...");
        const vectorSearch = new PsRagVectorSearch();
        const searchContext = await vectorSearch.search(userLastMessage, routingData, dataLayout);
        console.log("In Rebooting Democracy conversation");
        let messages = chatLogWithoutLastUserMessage.map((message) => {
            return {
                role: message.sender,
                content: message.message,
            };
        });
        const systemMessage = {
            role: "system",
            content: this.mainSreamingSystemPrompt,
        };
        messages.unshift(systemMessage);
        const finalUserQuestionText = `Original user question: ${userLastMessage} \nRewritten user question (for vector search): ${routingData.rewrittenUserQuestionVectorDatabaseSearch}`;
        const userMessage = {
            role: "user",
            content: this.mainStreamingUserPrompt(finalUserQuestionText, searchContext),
        };
        messages.push(userMessage);
        console.log(`Messages to chatbot: ${JSON.stringify(messages, null, 2)}`);
        try {
            const stream = await this.openaiClient.chat.completions.create({
                model: "gpt-4-0125-preview",
                messages,
                max_tokens: 4000,
                temperature: 0.0,
                stream: true,
            });
            await this.streamWebSocketResponses(stream);
        }
        catch (err) {
            console.error(`Error in Rebooting Democracy chatbot: ${err}`);
        }
    };
}
