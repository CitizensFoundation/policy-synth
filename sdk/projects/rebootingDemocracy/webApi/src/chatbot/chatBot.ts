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
- For longer outputs use bullet points and markdown to make the information easy to read.
- Do not reference your contexts and the different document sources just provide the information based on those sources.
- For all document sources we will provide the user with those you do not need to link or reference them.
- If there are inline links in the actual document chunks, you can provide those to the user in a markdown link format.
- Use markdown to format your answers, always use formatting so the response comes alive to the user.
- Keep your answers short and to the point except when the user asks for detail.
`;

  mainStreamingUserPrompt = (
    latestQuestion: string,
    context: string
  ) => `<CONTEXT_TO_ANSWER_USERS_QUESTION_FROM>
${context}
</CONTEXT_TO_ANSWER_USERS_QUESTION_FROM>

<LATEST_USER_QUESTION>
${latestQuestion}
</LATEST_USER_QUESTION>

Your thoughtful answer in markdown:
`;

  sendSourceDocuments(document: PsSimpleDocumentSource[]) {
    document.forEach((d, i) => {
      if (d.contentType.includes("json")) {
        const refurls = JSON.parse(d.allReferencesWithUrls);
        if (refurls.length > 0) document[i].url = refurls[0].url;
      }
    });

    const botMessage = {
      sender: "bot",
      type: "info",
      data: {
        name: "sourceDocuments",
        message: document,
      } as PsAgentStartWsOptions,
    } as PsAiChatWsMessage;

    if (this.wsClientSocket) {
      this.wsClientSocket.send(JSON.stringify(botMessage));
    } else {
      console.error("No wsClientSocket found");
    }
  }

  async rebootingDemocracyConversation(
    chatLog: PsSimpleChatLog[],
    dataLayout: PsIngestionDataLayout
  ) {
    this.setChatLog(chatLog);

    const userLastMessage = chatLog[chatLog.length - 1].message;
    console.log(`userLastMessage: ${userLastMessage}`);

    const chatLogWithoutLastUserMessage = chatLog.slice(0, -1);
    console.log(
      `chatLogWithoutLastUserMessage: ${JSON.stringify(
        chatLogWithoutLastUserMessage,
        null,
        2
      )}`
    );

    this.sendAgentStart("Thinking...");
    const router = new PsRagRouter();
    const routingData = await router.getRoutingData(
      userLastMessage,
      dataLayout,
      JSON.stringify(chatLogWithoutLastUserMessage)
    );

    this.sendAgentStart("Searching Rebooting Democracy...");
    const vectorSearch = new PsRagVectorSearch();
    const searchContextRaw = await vectorSearch.search(
      userLastMessage,
      routingData,
      dataLayout
    );

    const searchContext = await this.updateUrls(searchContextRaw);
    console.log("search_context", searchContext);
    console.log("In Rebooting Democracy conversation");
    let messages: any[] = chatLogWithoutLastUserMessage.map(
      (message: PsSimpleChatLog) => {
        return {
          role: message.sender,
          content: message.message,
        };
      }
    );

    const systemMessage = {
      role: "system",
      content: this.mainSreamingSystemPrompt,
    };

    messages.unshift(systemMessage);

    const finalUserQuestionText = `Original user question: ${userLastMessage} \nRewritten user question (for vector search): ${routingData.rewrittenUserQuestionVectorDatabaseSearch}`;

    const userMessage = {
      role: "user",
      content: this.mainStreamingUserPrompt(
        finalUserQuestionText,
        searchContext.responseText
      ),
    };

    messages.push(userMessage);

    console.log(`Messages to chatbot: ${JSON.stringify(messages, null, 2)}`);
    try {
      const stream = await this.openaiClient.chat.completions.create({
        model: "gpt-4-turbo",
        messages,
        max_tokens: 4000,
        temperature: 0.0,
        stream: true,
      });
      this.sendSourceDocuments(searchContext.documents);
      await this.streamWebSocketResponses(stream);
    } catch (err) {
      console.error(`Error in Rebooting Democracy chatbot: ${err}`);
    }
  }

  async updateUrls(searchContext: []) {
    const documents = searchContext.documents;
    let updatedResponseText = searchContext.responseText;

    documents.forEach((document, index) => {
      if (document.contentType && document.contentType.includes("json")) {
        console.log("Original URL:", document.url);

        // Parse the JSON string of allReferencesWithUrls
        const refUrls = JSON.parse(document.allReferencesWithUrls);

        // Check if there are any URLs available to update
        if (refUrls.length > 0) {
          // Store the old URL before updating
          const oldUrl = document.url;
          // Update the document's URL to the first reference URL
          // documents[index].url = refUrls[0].url;
          // Replace the old URL in the responseText with the new URL
          updatedResponseText = updatedResponseText.replace(
            oldUrl,
            refUrls[0].url
          );

          console.log("Updated URL:", documents[index].url);
        }
      }
    });
    searchContext.responseText = updatedResponseText;
    return searchContext;
  }
}
