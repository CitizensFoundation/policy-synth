
/**
 * Example memory interface describing how data is stored.
 * You’ll keep this interface consistent across all sub-agents.
 */
interface ParticipationDataAnalysisMemory extends PsAgentMemoryData {
  participationDataItems: ParticipationData[];
  fullReportOnAllItems?: string;
}

/**
 * Each entry from the Yrpri connector.
 */
interface ParticipationData {
  title: string;
  statement: string;
  region: string;
  profession: string;
  analysis?: ParticipationDataAnalysis;
}

/**
 * Analysis fields that sub-agents will fill in.
 */
interface ParticipationDataAnalysis {
  theme: string;
  sentimentAnalysis: string;
  condencedTheme?: string;
}