import { PsBaseChatBot } from "@policysynth/api/base/chat/baseChatBot.js";
import { PsRagRouter } from "./router.js";
import WebSocket from "ws";
import path from "path";
import XLSX from "xlsx";
import fs from "fs/promises";
import { QAPair } from "../models/qaPair.model.js";
import { GenerationConfig, Content } from "@google/generative-ai";

const aiModel = process.env.PS_AI_CHAT_MODEL_NAME || "gemini-2.0-pro-exp-02-05";
//const aiModel = "gemini-2.0-flash";

export class EcasYeaChatBot extends PsBaseChatBot {
  // Enable persistence
  persistMemory = true;

  mainSreamingSystemPrompt = (context: string) => `You are the ECAS (European Citizen Action Service) chatbot called ERIC (European Rights Information Centre) - a friendly AI that helps users find answers to their questions based on a database of previously asked questions with answers.

  <ABOUT_THIS_PROJECT>
Q&A on the theme: EU Residence right of third country nationals who are EU citizen's family members including the following 5 subtopics:
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
The EEA includes EU countries and also Iceland, Liechtenstein and Norway. It allows them to be part of the EU's single market.

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
- Refuse politely to answer questions that are not in your context and that are not on the topic of EU Residence right of third country nationals who are EU citizen's family member.
</IMPORTANT_INSTRUCTIONS>
`;

  mainStreamingUserPrompt = (
    latestQuestion: string,
    countryLinksInfo: string | undefined,
    euSignpostsInfo: string | undefined
  ) =>
    `${
  euSignpostsInfo
    ? `<POSSIBLY_RELEVANT_EU_SIGNPOSTS_INFO>
${euSignpostsInfo}
</POSSIBLY_RELEVANT_EU_SIGNPOSTS_INFO>`
    : ""
}

${
  countryLinksInfo
    ? `<COUNTRY_LINKS_INFO_POSSIBLY_RELEVANT_TO_THE_USER_QUESTION>
${countryLinksInfo}
</COUNTRY_LINKS_INFO_POSSIBLY_RELEVANT_TO_THE_USER_QUESTION>`
    : ""
}

<LATEST_USER_QUESTION>
${latestQuestion}
</LATEST_USER_QUESTION>

Your thoughtful answer in markdown:
`;

  searchContext?: {
    question: string;
    answer: string;
  }[];

  currentTopicId: number | undefined;

  constructor(
    wsClientId: string,
    wsClients: Map<string, WebSocket>,
    memoryId?: string,
    topicId?: number
  ) {
    super(wsClientId, wsClients, memoryId, "gemini", aiModel);
    this.currentTopicId = topicId;
    if (this.geminiClient) {
      this.geminiModel = this.geminiClient.getGenerativeModel({
        model: aiModel,
        // System prompt is set dynamically later
      });
    }
  }

  sendSourceDocuments(document: PsSimpleDocumentSource[]) {
    const botMessage = {
      sender: "bot",
      type: "info",
      data: {
        name: "sourceDocuments",
        message: document,
      },
    } as PsAiChatWsMessage;

    if (this.wsClientSocket) {
      this.wsClientSocket.send(JSON.stringify(botMessage));
    } else {
      console.error("No wsClientSocket found");
    }
  }

  async loadCountryLinksInfo(country: string) {
    try {
      const countryInfo = await fs.readFile(
        `countryInfo/${country}.txt`,
        "utf8"
      );
      return countryInfo;
    } catch (err) {
      console.error(`Error in loadCountryLinksInfo: ${err}`);
      return undefined;
    }
  }

  async loadEuSignpostsInfo() {
    try {
      const euSignpostsInfo = await fs.readFile(
        `countryInfo/eu_signposts.txt`,
        "utf8"
      );
      return euSignpostsInfo;
    } catch (err) {
      console.error(`Error in loadEuSignpostsInfo: ${err}`);
      return undefined;
    }
  }

  async loadQaPairsForTopic(topicId: number | undefined): Promise<{ question: string; answer: string }[]> {
    if (!topicId) {
      console.warn("No topic ID specified, using legacy XLSX loading as fallback.");
      // Fallback to legacy method if no topic ID
      throw new Error("No topic ID specified");
    }
    try {
      const qaPairs = await QAPair.findAll({
        where: { topicId: topicId },
        attributes: ['question', 'answer'], // Only fetch necessary fields
        raw: true, // Get plain objects
      });
      console.log(`Loaded ${qaPairs.length} Q&A pairs for topic ${topicId}`);
      return qaPairs as { question: string; answer: string }[];
    } catch (error) {
      console.error(`Error loading Q&A pairs for topic ${topicId}:`, error);
      return [];
    }
  }

  async streamResponse(prompt: string | Content | (string | Content)[], chatHistory: Content[]) {
    if (!this.geminiModel) {
      console.error('Gemini model is not initialized.');
      this.sendToClient('bot', 'Error: AI Model not initialized.', 'error');
      return;
    }

    this.sendAgentStart("Generating response...");

    try {
      const chat = this.geminiModel.startChat({ history: chatHistory });
      const result = await chat.sendMessageStream(prompt);

      this.sendToClient("bot", "", "start");
      let botMessage = "";
      for await (const chunk of result.stream) {
          if (chunk.text) {
            const chunkText = chunk.text();
            // Make sure chunkText is not empty before sending
            if (chunkText && chunkText.trim() !== "") {
              this.sendToClient("bot", chunkText);
            }
            botMessage += chunkText;
          } else {
            console.warn("Received chunk without text content.")
          }
      }

      // Save the bot's response to memory
      this.memory.chatLog!.push({
        sender: "assistant", // Ensure sender is 'assistant' for memory
        message: botMessage,
      });
      await this.saveMemoryIfNeeded();
      this.sendToClient("bot", "", "end");
    } catch (error: any) {
      console.error(`Error streaming response: ${error}`, error);
      // Attempt to parse GoogleGenerativeAI errors if possible
      let errorMessage = "An error occurred while generating the response.";
      if (error.message) {
        errorMessage = error.message;
      }
      this.sendToClient("bot", `Error: ${errorMessage}`, "error");
      this.sendToClient("bot", "", "end");
    }
  }

  async ecasYeaConversation(chatLog: PsSimpleChatLog[]) {
    await this.setChatLog(chatLog);
    const userLastMessage = chatLog[chatLog.length - 1].message;
    const chatLogWithoutLastUserMessage = chatLog.slice(0, -1);

    console.log(`User Message: ${userLastMessage}`);
    console.log(`Using Topic ID: ${this.currentTopicId}`);

    this.sendAgentStart("Loading context...");

    try {
      this.searchContext = await this.loadQaPairsForTopic(this.currentTopicId);
    } catch (error) {
      console.error(`Error loading Q&A pairs for topic ${this.currentTopicId}:`, error);
      this.sendToClient("bot", "Error: Could not load Q&A pairs for topic.", "error");
      return;
    }

    if (!this.searchContext || this.searchContext.length === 0) {
        const errorMsg = this.currentTopicId
          ? `I could not find any Q&A content for the selected topic (ID: ${this.currentTopicId}). Please try another topic or contact an administrator.`
          : "Please select a topic first before asking a question.";
        this.sendToClient("bot", errorMsg, "error"); // Use sendToClient for errors
        console.error(`No search context found for topic ${this.currentTopicId}`);
        return;
    }

    // Dynamically set the system prompt with the loaded context
    if (this.geminiClient && this.geminiModel) {
      // Re-initialize model with new system instruction for this conversation
      this.geminiModel = this.geminiClient.getGenerativeModel({
        model: aiModel,
        systemInstruction: this.mainSreamingSystemPrompt(
          JSON.stringify(this.searchContext, null, 2)
        ),
        // Add safety settings if needed
      });
    } else {
        this.sendToClient("bot", "Error: AI model not initialized properly.", "error"); // Use sendToClient
        console.error("Gemini client or model not available");
        return;
    }

    this.sendAgentStart("Analyzing query...");
    // Correct PsRagRouter instantiation (assuming it takes memory)
    // If it requires more params, adjust based on its definition
    //@ts-ignore - Assuming BaseChatBot handles memory correctly
    const router = new PsRagRouter(this.memory);
    const routingData = await router.getRoutingData(
        userLastMessage,
        JSON.stringify(chatLogWithoutLastUserMessage)
      );

    console.log(`Routing data: ${JSON.stringify(routingData, null, 2)}`);

    let countryLinksInfo: string | undefined;
    if (routingData.countryUserIsAskingAbout) {
        this.sendAgentStart(`Loading links for ${routingData.countryUserIsAskingAbout}...`);
        countryLinksInfo = await this.loadCountryLinksInfo(routingData.countryUserIsAskingAbout);
    } else {
        // Fallback regex check if router doesn't find country
        const RelevantCountryRegEx = /\b(Austria|Belgium|Bulgaria|Croatia|Cyprus|Czech Republic|Denmark|Estonia|Finland|France|Germany|Greece|Hungary|Ireland|Italy|Latvia|Lithuania|Luxembourg|Malta|Netherlands|Poland|Portugal|Romania|Slovakia|Slovenia|Spain|Sweden)\b/i;
        const relevantCountry = RelevantCountryRegEx.exec(userLastMessage);
        if (relevantCountry) {
            console.log(`Fallback regex detected country: ${relevantCountry[0]}`);
            this.sendAgentStart(`Loading links for ${relevantCountry[0]}...`);
            countryLinksInfo = await this.loadCountryLinksInfo(relevantCountry[0]);
        }
    }

    const euSignpostsInfo = await this.loadEuSignpostsInfo();

    // Convert chat history to Gemini format
    const history: Content[] = chatLogWithoutLastUserMessage.map(
        (msg: PsSimpleChatLog): Content => ({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.message }],
        })
      );

    // Call the new streaming method
    await this.streamResponse(this.mainStreamingUserPrompt(
        userLastMessage,
        countryLinksInfo,
        euSignpostsInfo
      ), history);
  }
}
