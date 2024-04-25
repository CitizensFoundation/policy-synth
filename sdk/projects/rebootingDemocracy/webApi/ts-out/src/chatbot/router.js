import { PsIngestionConstants } from "../ingestion/ingestionConstants.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { BaseIngestionAgent } from "../ingestion/baseAgent.js";
export class PsRagRouter extends BaseIngestionAgent {
    systemMessage = (schema, about, chatHistory) => new SystemMessage(`You are an expert user question analyzer for a RAG based chatbot. We will use the information to decide what documents to retrieve for the user through a vector database search.

Instructions:
- Use the available categories to classify the question the user will provide you with in the LATEST_QUESTION_FROM_USER tag
- Always output one primary category
- Output one or more secondary categories if those could help answer the user question if there is any chance it could help, even if small
- Always keep a track of what topic you are discussing with the user from your chat history and include that topic in the "rewrittenUserQuestionVectorDatabaseSearch" JSON field.
- Still allow the user to change the topic if they want to in a middle of the converstation, when it's clear and in that case do not include the old topic in the new user question.
- Always rewrite the user question based on your conversation history with the user as needed for the best possible vector search query and include it in "rewrittenUserQuestionVectorDatabaseSearch" JSON field.


Your conversation history with the user:
${chatHistory}

About this project:
${about}

Available primary and secondary categories:
${schema}

JSON Output:
{
  primaryCategory: string;
  secondaryCategories: string[];
  userIsAskingForLatestContent: boolean;
  isAskingAboutOneSpecificDetail: string;
  isAskingAboutOneSpecificProject: string;
  rewrittenUserQuestionVectorDatabaseSearch: string;
}
`);
    userMessage = (question) => new HumanMessage(`<LATEST_QUESTION_FROM_USER>${question}</LATEST_QUESTION_FROM_USER>

Your JSON classification:
`);
    async getRoutingData(userQuestion, dataLayout, chatHistory) {
        const routingInformation = await this.callLLM("ingestion-agent", PsIngestionConstants.ingestionMainModel, this.getFirstMessages(this.systemMessage(JSON.stringify(dataLayout.categories), dataLayout.aboutProject, chatHistory), this.userMessage(userQuestion)));
        console.log(`Routing information: ${JSON.stringify(routingInformation, null, 2)}`);
        return routingInformation;
    }
}
