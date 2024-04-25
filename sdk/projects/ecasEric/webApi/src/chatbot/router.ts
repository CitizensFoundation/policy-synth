import { PsIngestionConstants } from "../ingestion/ingestionConstants.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { BaseIngestionAgent } from "../ingestion/baseAgent.js";

export class PsRagRouter extends BaseIngestionAgent {

systemMessage = (chatHistory: string) =>
new SystemMessage(`You are an expert user question analyzer for a RAG based chatbot. We will use the information to decide what documents to retrieve for the user through a vector database search.

Instructions:
- Always keep a track of what topic you are discussing with the user from your chat history and include that topic in the "rewrittenUserQuestionVectorDatabaseSearch" JSON field.
- Still allow the user to change the topic if they want to in a middle of the converstation, when it's clear and in that case do not include the old topic in the new user question.
- Always rewrite the user question based on your conversation history with the user as needed for the best possible vector search query and include it in "rewrittenUserQuestionVectorDatabaseSearch" JSON field.

Your conversation history with the user:
${chatHistory}

About this project:
Q&A on the theme: EU Residence right of third country nationals who are EU citizen’s family members including the following 5 subtopics:

The notion of family member
Conditions of the right to stay
Formalities
Permanent residence
Equal treatment
The questions are not classified by sub-topic, as questions can (and often do in YEA) cover several sub-topics. They are therefore classified by type of question: legal information, legal advice and legal assistance.

The EU countries are:
Austria, Belgium, Bulgaria, Croatia, Republic of Cyprus, Czech Republic, Denmark, Estonia, Finland, France, Germany, Greece, Hungary, Ireland, Italy, Latvia, Lithuania, Luxembourg, Malta, Netherlands, Poland, Portugal, Romania, Slovakia, Slovenia, Spain and Sweden.

The European Economic Area (EEA)
The EEA includes EU countries and also Iceland, Liechtenstein and Norway. It allows them to be part of the EU’s single market.

Switzerland is not an EU or EEA member but is part of the single market. This means Swiss nationals have the same rights to live and work in the UK as other EEA nationals.

JSON Output:
{
rewrittenUserQuestionVectorDatabaseSearch: string;
}
`);

  userMessage = (question: string) =>
    new HumanMessage(`<LATEST_QUESTION_FROM_USER>${question}</LATEST_QUESTION_FROM_USER>

Your JSON classification:
`);

  async getRoutingData(
    userQuestion: string,
    chatHistory: string
  ): Promise<PsRagRoutingResponse> {
    const routingInformation: PsRagRoutingResponse = await this.callLLM(
      "ingestion-agent",
      PsIngestionConstants.ingestionMainModel,
      this.getFirstMessages(
        this.systemMessage(
          chatHistory
        ),
        this.userMessage(userQuestion)
      ),
    );

    console.log(`Routing information: ${JSON.stringify(routingInformation, null, 2)}`)

    return routingInformation;
  }
}
