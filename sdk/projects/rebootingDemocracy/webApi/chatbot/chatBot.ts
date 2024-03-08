import { PsBaseChatBot } from "@policysynth/api/base/chat/baseChatBot.js";

import { PsRagRouter } from "./router.js";

export class RebootingDemocracyChatBot extends PsBaseChatBot {
  persistMemory = true;

  mainSreamingSystemPrompt = `You are the Rebooting Democracy chatbot.
The user will ask a question, we will search a large database in a vector store and bring information connected to the user question into your <CONTEXT_TO_ANSWER_USERS_QUESTION_FROM> to provide a thoughtful answer from.
If not enough information is available, you can ask the user for more information.
Never provide information that is not backed by your context or is comment knowledge.
Use markdown to format your answers, use nice formatting.
Keep your answers short and to the point except when the user asks for detail.
`;

  mainStreamingUserPrompt = (
    latestQuestion: string,
    context: string
  ) => `<LATEST_USER_QUESTION>
${latestQuestion}</LATEST_USER_QUESTION>

<CONTEXT_TO_ANSWER_USERS_QUESTION_FROM>
${context}
</CONTEXT_TO_ANSWER_USERS_QUESTION_FROM>

Your thoughtful answer in markdown:
`;

  rebootingDemocracyConversation = async (
    chatLog: PsSimpleChatLog[],
    dataLayout: PsIngestionDataLayout
  ) => {
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
      chatLogWithoutLastUserMessage.length > 0
        ? JSON.stringify(chatLog, null, 2)
        : undefined,
      dataLayout
    );

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

    const userMessage = {
      role: "user",
      content: this.mainStreamingUserPrompt(
        userLastMessage,
        searchContext
      ),
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
    } catch (err) {
      console.error(`Error in Rebooting Democracy chatbot: ${err}`);
    }
  };
}
