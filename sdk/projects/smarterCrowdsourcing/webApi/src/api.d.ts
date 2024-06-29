type PSChatBotMemoryStageTypes = PsScMemoryStageTypes | "chatbot-conversation";

interface PsChatBotMemoryData extends PsSmarterCrowdsourcingMemoryData {
  stages: Record<PSChatBotMemoryStageTypes, PsScStagesData>;
  chatLog?: PsSimpleChatLog[];
  problemStatement?: PsProblemStatement;
  currentStage: PSChatBotMemoryStageTypes;
  groupId?: number;
  communityId?: number;
  domainId?: number;
  totalCost?: number;
  customInstructions?: object,
  subProblems?: PsSubProblem[],
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