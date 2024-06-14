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

interface YpUserData {
  id: number;
  email: string;
  created_at: Date;
  updated_at: Date;
}

interface YpGroupData {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
}