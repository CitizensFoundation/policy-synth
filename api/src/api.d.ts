type PSChatBotStageTypes = IEngineStageTypes | "chatbot-conversation";

interface PsChatBotMemoryData extends IEngineInnovationMemoryData {
  stages: Record<PSChatBotStageTypes, IEngineInnovationStagesData>;
  chatLog?: PsSimpleChatLog[];
  problemStatement?: PsProblemStatement;
  currentStage: PSChatBotStageTypes;
  groupId?: number;
  communityId?: number;
  domainId?: number;
  totalCost?: number;
  customInstructions?: object,
  subProblems?: IEngineSubProblem[],
  currentStageData?: undefined;
}
