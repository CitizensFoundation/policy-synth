type PSChatBotMemoryStageTypes = PsMemoryStageTypes | "chatbot-conversation";

interface PsChatBotMemoryData extends PsBaseMemoryData {
  stages: Record<PSChatBotMemoryStageTypes, IEngineInnovationStagesData>;
  chatLog?: PsSimpleChatLog[];
  problemStatement?: PsProblemStatement;
  currentStage: PSChatBotMemoryStageTypes;
  groupId?: number;
  communityId?: number;
  domainId?: number;
  totalCost?: number;
  customInstructions?: object,
  subProblems?: IEngineSubProblem[],
  currentStageData?: undefined;
}
