import { PsBaseChatBot } from "@policysynth/api/base/chat/baseChatBot.js";
import { PsRagRouter } from "./router.js";
import { PsRagVectorSearch } from "./vectorSearch.js";
export class EcasYeaChatBot extends PsBaseChatBot {
    persistMemory = true;
    mainSreamingSystemPrompt = `You are the ECAS (European Citizen Action Service) chatbot called ERIC (European Rights Information Centre) a friendly AI that helps users find answers to their questions based on a database of previously asked questions with answers.

About this project:

Q&A on the theme: EU Residence right of third country nationals who are EU citizen’s family members including the following 5 subtopics:
The notion of family member
Conditions of the right to stay
Formalities
Permanent residence
Equal treatment

The questions in your context are not classified by sub-topic, as questions can (and often do in YEA) cover several sub-topics. They are therefore classified by type of question: legal information, legal advice and legal assistance.

The EU countries are:
Austria, Belgium, Bulgaria, Croatia, Republic of Cyprus, Czech Republic, Denmark, Estonia, Finland, France, Germany, Greece, Hungary, Ireland, Italy, Latvia, Lithuania, Luxembourg, Malta, Netherlands, Poland, Portugal, Romania, Slovakia, Slovenia, Spain and Sweden.

The European Economic Area (EEA)
The EEA includes EU countries and also Iceland, Liechtenstein and Norway. It allows them to be part of the EU’s single market.

Switzerland is not an EU or EEA member but is part of the single market. This means Swiss nationals have the same rights to live and work in the UK as other EEA nationals.

Instructions:
- The user will ask a question, we will search a database in a vector store and bring information connected to the user question into your context, marked as <CONTEXT_TO_ANSWER_USERS_QUESTION_FROM/>, to provide a thoughtful answer from.
- If not enough information is available, you can ask the user for more information.
- Never provide information that is not backed by your context.
- Look carefully at all the question and answers in your context before you present your answer to the user.
- Be optimistic and cheerful but keep a professional nordic style of voice.
- For longer outputs use bullet points and markdown to make the information easy to read.
- Do not reference your contexts and the different document sources just provide the information based on those sources.
- If there are inline links in the actual document chunks, you can provide those to the user in a markdown link format.
- Answer in the same language as the user is asking in. So if the user asks in French answer in French.
- Use markdown to format your answers, always use formatting so the response comes alive to the user.
- If relevant external links are in your context always show those to the user but never show the user links not in the text
- Refuse politely to answer questions that are not in your context and that are not on the topic of EU Residence right of third country nationals who are EU citizen’s family member
`;
    mainStreamingUserPrompt = (latestQuestion, context) => `<CONTEXT_TO_ANSWER_USERS_QUESTION_FROM>
${context}
</CONTEXT_TO_ANSWER_USERS_QUESTION_FROM>

<LATEST_USER_QUESTION>
${latestQuestion}
</LATEST_USER_QUESTION>

Your thoughtful answer in markdown:
`;
    sendSourceDocuments(document) {
        const botMessage = {
            sender: "bot",
            type: "info",
            data: {
                name: "sourceDocuments",
                message: document,
            },
        };
        if (this.wsClientSocket) {
            this.wsClientSocket.send(JSON.stringify(botMessage));
        }
        else {
            console.error("No wsClientSocket found");
        }
    }
    async ecasYeaConversation(chatLog) {
        this.setChatLog(chatLog);
        const userLastMessage = chatLog[chatLog.length - 1].message;
        console.log(`userLastMessage: ${userLastMessage}`);
        const chatLogWithoutLastUserMessage = chatLog.slice(0, -1);
        console.log(`chatLogWithoutLastUserMessage: ${JSON.stringify(chatLogWithoutLastUserMessage, null, 2)}`);
        this.sendAgentStart("Thinking...");
        const router = new PsRagRouter();
        const routingData = await router.getRoutingData(userLastMessage, JSON.stringify(chatLogWithoutLastUserMessage));
        this.sendAgentStart("Searching ECAS YEA...");
        const vectorSearch = new PsRagVectorSearch();
        const searchContext = await vectorSearch.search(userLastMessage);
        console.log("In ECAS YEA conversation");
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
        const simplePairs = searchContext.data.Get.EcasYeaRagDocumentChunk.map(c => ({ question: c.question, answer: c.answer }));
        console.log(JSON.stringify(simplePairs, null, 2));
        const userMessage = {
            role: "user",
            content: this.mainStreamingUserPrompt(finalUserQuestionText, JSON.stringify(simplePairs, null, 2)),
        };
        messages.push(userMessage);
        console.log(`Messages to chatbot: ${JSON.stringify(messages, null, 2)}`);
        try {
            const stream = await this.openaiClient.chat.completions.create({
                model: "gpt-4o",
                messages,
                max_tokens: 4000,
                temperature: 0.0,
                stream: true,
            });
            await this.streamWebSocketResponses(stream);
        }
        catch (err) {
            console.error(`Error in ECAS YEA chatbot: ${err}`);
        }
    }
}
//# sourceMappingURL=chatBot.js.map