import { PsAiModelSize, PsAiModelType } from "@policysynth/agents/aiModelTypes.js";
import { PsIngestionConstants } from "../ingestion/ingestionConstants.js";
import { PolicySynthStandaloneAgent } from "@policysynth/agents/base/agentStandalone.js";

export class PsRagRouter extends PolicySynthStandaloneAgent {
  constructor(
    memory: any,
    private topicTitle: string = "",
    private topicDescription: string = ""
  ) {
    super(memory);
  }

  override get modelTemperature() {
    return 0.0;
  }

  override get maxModelTokensOut() {
    return 1000;
  }

systemMessage = (chatHistory: string) =>
this.createSystemMessage(`You are an expert user question analyzer for a RAG based chatbot. The chatbot focuses on "${this.topicTitle}". Use the topic description below when rewriting the user's question.

Topic description: ${this.topicDescription}

We will use the information to decide what documents to retrieve for the user through a vector database search.

Instructions:
- Always keep a track of what topic you are discussing with the user from your chat history and include that topic in the "rewrittenUserQuestionForVectorDatabaseSearch" JSON field.
- Still allow the user to change the topic if they want to in a middle of the converstation, when it's clear and in that case do not include the old topic in the new user question.
- Always rewrite the user question based on your conversation history with the user as needed for the best possible vector search query and include it in "rewrittenUserQuestionForVectorDatabaseSearch" JSON field.

Your conversation history with the user:
${chatHistory}

The EU countries are:
Austria, Belgium, Bulgaria, Croatia, Republic of Cyprus, Czech Republic, Denmark, Estonia, Finland, France, Germany, Greece, Hungary, Ireland, Italy, Latvia, Lithuania, Luxembourg, Malta, Netherlands, Poland, Portugal, Romania, Slovakia, Slovenia, Spain and Sweden.

The European Economic Area (EEA)
The EEA includes EU countries and also Iceland, Liechtenstein and Norway. It allows them to be part of the EU’s single market.

Switzerland is not an EU or EEA member but is part of the single market. This means Swiss nationals have the same rights to live and work in the UK as other EEA nationals.

Use this list of countries for countryUserIsAskingAbout field, if the country is not in the list, leave the field empty:
[
  "austria",
  "belgium",
  "croatia",
  "cyprus",
  "czech_republic",
  "denmark",
  "estonia",
  "finland",
  "france",
  "germany",
  "greece",
  "hungary",
  "ireland",
  "italy",
  "latvia",
  "lithuania",
  "luxembourg",
  "malta",
  "poland",
  "portugal",
  "romania",
  "slovakia",
  "slovenia",
  "spain",
  "sweden",
  "the_netherlands"
]


JSON Output:
{
rewrittenUserQuestionForVectorDatabaseSearch: string;
countryUserIsAskingAbout?: string;
}
`);

  userMessage = (question: string) =>
    this.createHumanMessage(`<LATEST_QUESTION_FROM_USER>${question}</LATEST_QUESTION_FROM_USER>

Your JSON classification:
`);

  async getRoutingData(
    userQuestion: string,
    chatHistory: string
  ): Promise<PsRagRoutingResponse> {
    const routingInformation: PsRagRoutingResponse = await this.callModel(
      PsAiModelType.Text,
      PsAiModelSize.Medium,
      [this.systemMessage(chatHistory), this.userMessage(userQuestion)]
    );

    console.log(`Routing information: ${JSON.stringify(routingInformation, null, 2)}`)

    return routingInformation as PsRagRoutingResponse;
  }
}

interface PsRagRoutingResponse {
  rewrittenUserQuestionForVectorDatabaseSearch: string;
  countryUserIsAskingAbout?: string;
}
