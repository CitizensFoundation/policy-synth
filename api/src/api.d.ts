
type PSChatBotStageTypes = IEngineStageTypes & "chatbot-conversation";

interface PsChatBotMemoryData extends IEngineInnovationMemoryData {
  stages: Record<PSChatBotStageTypes, IEngineInnovationStagesData>;
  chatLog?: PsSimpleChatLog[];
  problemStatement?: PsProblemStatement;
}
