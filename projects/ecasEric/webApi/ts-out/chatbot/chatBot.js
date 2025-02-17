import { PsBaseChatBot } from "@policysynth/api/base/chat/baseChatBot.js";
import { PsRagRouter } from "./router.js";
import path from "path";
import XLSX from "xlsx";
import fs from "fs/promises";
const aiModel = process.env.PS_AI_CHAT_MODEL_NAME || "gemini-2.0-pro-exp-02-05";
//const aiModel = "gemini-2.0-flash";
export class EcasYeaChatBot extends PsBaseChatBot {
    // Enable persistence
    persistMemory = true;
    mainSreamingSystemPrompt = (context) => `You are the ECAS (European Citizen Action Service) chatbot called ERIC (European Rights Information Centre) - a friendly AI that helps users find answers to their questions based on a database of previously asked questions with answers.

  <ABOUT_THIS_PROJECT>
Q&A on the theme: EU Residence right of third country nationals who are EU citizen’s family members including the following 5 subtopics:
- The notion of family member
- Conditions of the right to stay
- Formalities
- Permanent residence
- Equal treatment

The questions in your context are not classified by sub-topic, as questions can (and often do in YEA) cover several sub-topics. They are therefore classified by type of question: legal information, legal advice and legal assistance.
</ABOUT_THIS_PROJECT>

<BASIC_INFORMATION_ABOUT_EU_COUNTRIES>
The EU countries are:
Austria, Belgium, Bulgaria, Croatia, Republic of Cyprus, Czech Republic, Denmark, Estonia, Finland, France, Germany, Greece, Hungary, Ireland, Italy, Latvia, Lithuania, Luxembourg, Malta, Netherlands, Poland, Portugal, Romania, Slovakia, Slovenia, Spain and Sweden.
</BASIC_INFORMATION_ABOUT_EU_COUNTRIES>

<BASIC_INFORMATION_ABOUT_EU_ECONOMIC_AREA>
The European Economic Area (EEA):
The EEA includes EU countries and also Iceland, Liechtenstein and Norway. It allows them to be part of the EU’s single market.

Switzerland is not an EU or EEA member but is part of the single market. This means Swiss nationals have the same rights to live and work in the UK as other EEA nationals.
</BASIC_INFORMATION_ABOUT_EU_ECONOMIC_AREA>

<QUESTIONS_WITH_ANSWERS_AS_CONTEXT_TO_ANSWER_USERS_QUESTION_FROM>
${context}
</QUESTIONS_WITH_ANSWERS_AS_CONTEXT_TO_ANSWER_USERS_QUESTION_FROM>

<IMPORTANT_INSTRUCTIONS>
- The user will ask a question and we have provided a <QUESTIONS_WITH_ANSWERS_AS_CONTEXT_TO_ANSWER_USERS_QUESTION_FROM>, to provide a thoughtful answer from, do not reference those directly as the user will not see them.
- If not enough information is available, you can ask the user for more information.
- Never provide information that is not backed by your context.
- Look carefully at all the question and answers in your context before you present your answer to the user.
- Be optimistic and cheerful but keep a professional nordic style of voice.
- For longer outputs use bullet points and markdown to make the information easy to read.
- Do not reference your contexts and the different document sources; just provide the information based on those sources.
- If there are inline links in the actual document chunks, you can provide those to the user in a markdown link format.
- Answer in the same language as the user is asking in. So if the user asks in French, answer in French.
- Use markdown to format your answers, always use formatting so the response comes alive to the user.
- If relevant external links are in your context always show those to the user but never show the user links not in the text.
- Use simple language not legal language.
- Show the user useful links in correct markdown format.
- Refuse politely to answer questions that are not in your context and that are not on the topic of EU Residence right of third country nationals who are EU citizen’s family member.
</IMPORTANT_INSTRUCTIONS>
`;
    mainStreamingUserPrompt = (latestQuestion, countryLinksInfo, euSignpostsInfo) => `${euSignpostsInfo
        ? `<POSSIBLY_RELEVANT_EU_SIGNPOSTS_INFO>
${euSignpostsInfo}
</POSSIBLY_RELEVANT_EU_SIGNPOSTS_INFO>`
        : ""}

${countryLinksInfo
        ? `<COUNTRY_LINKS_INFO_POSSIBLY_RELEVANT_TO_THE_USER_QUESTION>
${countryLinksInfo}
</COUNTRY_LINKS_INFO_POSSIBLY_RELEVANT_TO_THE_USER_QUESTION>`
        : ""}

<LATEST_USER_QUESTION>
${latestQuestion}
</LATEST_USER_QUESTION>

Your thoughtful answer in markdown:
`;
    searchContext;
    constructor(wsClientId, wsClients, memoryId) {
        super(wsClientId, wsClients, memoryId, "gemini", aiModel);
        if (this.geminiClient) {
            this.geminiModel = this.geminiClient.getGenerativeModel({
                model: aiModel,
                systemInstruction: this.mainSreamingSystemPrompt(JSON.stringify(this.searchContext, null, 2)),
            });
        }
        this.setupSearchContext();
    }
    async setupSearchContext() {
        try {
            this.searchContext = await this.getChunksFromXlsx("ecas2.xlsx");
        }
        catch (err) {
            console.error(`Error in setupSearchContext: ${err}`);
        }
    }
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
    async getChunksFromXlsx(filePath) {
        // Convert filePath to absolute if not already
        const absoluteFilePath = path.resolve(filePath);
        // Read the Excel file
        const workbook = XLSX.readFile(absoluteFilePath);
        // Assuming the data is in the first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        // Convert sheet to JSON, explicitly stating the expected format
        // Since there's no header, every row is treated as data
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        // Map rows to desired format without skipping any rows
        const chunks = rows
            .filter(([question, answer]) => question && answer) // Checks if both question and answer are not empty or undefined
            .map(([question, answer]) => ({ question, answer }));
        //console.log(JSON.stringify(chunks, null, 2));
        return chunks;
    }
    async loadCountryLinksInfo(country) {
        try {
            const countryInfo = await fs.readFile(`countryInfo/${country}.txt`, "utf8");
            return countryInfo;
        }
        catch (err) {
            console.error(`Error in loadCountryLinksInfo: ${err}`);
            return undefined;
        }
    }
    async loadEuSignpostsInfo() {
        try {
            const euSignpostsInfo = await fs.readFile(`countryInfo/eu_signposts.txt`, "utf8");
            return euSignpostsInfo;
        }
        catch (err) {
            console.error(`Error in loadEuSignpostsInfo: ${err}`);
            return undefined;
        }
    }
    async ecasYeaConversation(chatLog) {
        // Save the chat log into memory
        await this.setChatLog(chatLog);
        // Extract the user’s latest message and the previous conversation
        const userLastMessage = chatLog[chatLog.length - 1].message;
        console.log(`userLastMessage: ${userLastMessage}`);
        const chatLogWithoutLastUserMessage = chatLog.slice(0, -1);
        console.log(`chatLogWithoutLastUserMessage: ${JSON.stringify(chatLogWithoutLastUserMessage, null, 2)}`);
        this.sendAgentStart("Evaluating user question...");
        //@ts-ignore
        const router = new PsRagRouter(undefined, this.memory, 0, 100);
        const routingData = await router.getRoutingData(userLastMessage, JSON.stringify(chatLogWithoutLastUserMessage));
        let countryLinksInfo;
        const euSignpostsInfo = await this.loadEuSignpostsInfo();
        if (routingData.countryUserIsAskingAbout) {
            countryLinksInfo = await this.loadCountryLinksInfo(routingData.countryUserIsAskingAbout);
        }
        this.sendAgentStart("Reasoning...");
        /*
          const vectorSearch = new PsRagVectorSearch(undefined, this.memory as any, 0, 100);
          const searchContext = await vectorSearch.search(userLastMessage);
        */
        console.log("In ECAS YEA conversation");
        const finalUserQuestionText = userLastMessage;
        // Build the user prompt using the custom user prompt template.
        const userPrompt = this.mainStreamingUserPrompt(finalUserQuestionText, countryLinksInfo, euSignpostsInfo);
        console.log(`userPrompt: ${userPrompt}`);
        // Build Gemini chat history from previous messages.
        // Convert "bot" sender to "model" and "user" remains "user".
        let geminiHistory = chatLogWithoutLastUserMessage.map((message) => ({
            role: message.sender === "assistant" ? "model" : "user",
            parts: [{ text: message.message }],
        }));
        console.log(`geminiHistory: ${JSON.stringify(geminiHistory, null, 2)}`);
        /*const simplePairs = searchContext.data.Get.EcasYeaRagDocumentChunk.map(
          (c: any) => ({
            question: c.question,
            answer: c.answer,
          })
        );
        console.log(JSON.stringify(simplePairs, null, 2));*/
        // Create a Gemini chat session with the prior conversation
        const chat = this.geminiModel.startChat({ history: geminiHistory });
        try {
            // Send the current user message as a stream.
            const result = await chat.sendMessageStream(userPrompt);
            this.sendToClient("bot", "", "start");
            let botMessage = "";
            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                this.sendToClient("bot", chunkText);
                botMessage += chunkText;
            }
            // Save the bot's response to memory
            this.memory.chatLog.push({
                sender: "bot",
                message: botMessage,
            });
            await this.saveMemoryIfNeeded();
            this.sendToClient("bot", "", "end");
        }
        catch (err) {
            console.error(`Error in ECAS YEA chatbot: ${err}`);
            this.sendToClient("bot", "There has been an error, please retry", "error");
            this.sendToClient("bot", "", "end");
        }
    }
}
//# sourceMappingURL=chatBot.js.map