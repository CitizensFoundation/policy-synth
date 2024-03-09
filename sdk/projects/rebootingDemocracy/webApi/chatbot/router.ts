import { PsIngestionConstants } from "../ingestion/ingestionConstants.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { BaseIngestionAgent } from "../ingestion/baseAgent.js";

export class PsRagRouter extends BaseIngestionAgent {
  systemMessage = (schema: string, about: string, simpleChatHistory: string | undefined) =>
    new SystemMessage(`You are an expert user question analyzer for a RAG based chatbot. We will use the information to decide what documents to retrieve for the user through a vector database search.

Instructions:
- Use the available categories to classify the question the user will provide you with in the DOCUMENT_TO_CLASSIFY tag
- Always output one primary category
- Output one or more secondary categories if those could help answer the user question if there is any chance it could help, even if small
- Always rewrite the user question based on your previous conversation with the user as needed for the best possible and best informed vector search query.
- Think step by step

About this project:
${about}

${simpleChatHistory ? `Your full conversation history with the user:
${simpleChatHistory}` : ``}

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

  userMessage = (question: string) =>
    new HumanMessage(`<LATEST_QUESTION_FROM_USER>${question}</LATEST_QUESTION_FROM_USER>

Your JSON classification:
`);

  async getRoutingData(
    userQuestion: string,
    chatHistory: string | undefined,
    dataLayout: PsIngestionDataLayout
  ): Promise<PsRagRoutingResponse> {
    const routingInformation: PsRagRoutingResponse = await this.callLLM(
      "ingestion-agent",
      PsIngestionConstants.ingestionMainModel,
      this.getFirstMessages(
        this.systemMessage(
          JSON.stringify(dataLayout.categories),
          dataLayout.aboutProject,
          chatHistory
        ),
        this.userMessage(userQuestion)
      )
    );

    return routingInformation;
  }
}
