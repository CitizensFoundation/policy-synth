interface PsBaseModelClass {
  id: number;
  uuid: string;
  user_id: number;
  created_at: Date;
  updated_at: Date;
}

interface PsBaseModelClassNoUuid extends Omit<PsBaseModelClass, "uuid"> {}

interface PsAzureAiModelConfig {
  endpoint: string;
  apiKey: string;
  deploymentName: string;
  modelName: string;
  maxTokensOut?: number;
  reasoningEffort?: 'low' | 'medium' | 'high';
  temperature?: number;
}

interface PsAiModelConfig {
  apiKey: string;
  modelName: string;
  provider?: string;
  maxTokensOut?: number;
  maxContextTokens?: number;
  modelType: import("./aiModelTypes.js").PsAiModelType;
  modelSize: import("./aiModelTypes.js").PsAiModelSize;
  temperature?: number;
  reasoningEffort?: 'low' | 'medium' | 'high';
  maxThinkingTokens?: number;
  timeoutMs?: number;
  prices: PsBaseModelPriceConfiguration;
  parallelToolCalls?: boolean;
}

interface PsCallModelOptions {
  parseJson?: boolean;
  limitedRetries?: boolean;
  overrideMaxRetries?: number;
  tokenOutEstimate?: number;
  streamingCallbacks?: Function;
  modelProvider?: string; // e.g. "openai", "anthropic", "google", "azure"
  modelName?: string; // e.g. "gpt-4o", "gemin-2.5-pro", etc.
  modelTemperature?: number;
  maxTokensOut?: number;
  modelMaxThinkingTokens?: number;
  modelReasoningEffort?: "low" | "medium" | "high";
  retryLimitFor429sUntilFallback?: number;
  fallbackModelProvider?: string;
  fallbackModelName?: string;
  fallbackModelType?: import("./aiModelTypes.js").PsAiModelType;
  simulateContentErrorForFallbackDebugging?: boolean;
  promptImages?: {
    mimeType: string;
    data: string;
  }[];
  /**
   * Optional Model function tools that the model may call during generation.
   */
  functions?: Array<{
    type: "function";
    function: {
      name: string;
      description?: string;
      parameters?: Record<string, unknown>;
    };
  }>;
  /**
   * Tool choice passed to the model when using function calling.
   */
  toolChoice?: "auto" | { type: "function"; function: { name: string } };
  /**
   * Names of function tools the model is allowed to call when using the model.
   */
  allowedTools?: string[];
  /**
   * When true, token limit errors will be rethrown instead of triggering
   * the TokenLimitChunker retry logic. Useful for preventing infinite
   * retry loops if chunking already failed.
   */
  disableChunkingRetry?: boolean;
  /**
   * Optional XML tag name to preserve when the TokenLimitChunker needs to split
   * a document due to token limits. If provided, the chunker will search for
   * this tag instead of blindly grabbing the first XML tag in the message.
   */
  xmlTagToPreserveForTooManyTokenSplitting?: string;
  /**
   * Number of last words from the document message to preserve when the
   * TokenLimitChunker needs to split a document due to token limits.
   * Defaults to 50 words if not provided.
   */
  numberOfLastWordsToPreserveForTooManyTokenSplitting?: number;
  /**
   * Maximum number of document chunks allowed when the TokenLimitChunker
   * splits a document due to token limits. Defaults to 10. If the
   * chunker needs to create more chunks than this value an error will be
   * thrown to prevent excessive costs.
   */
  maximumNumberOfSplitDocumentChunks?: number;
}

interface PsAzureAiModelConfig extends PsAiModelConfig {
  endpoint: string;
  deploymentName: string;
}

interface PsOpenAiModelConfig extends PsAiModelConfig {
  projectId?: string;
}

// Evaluation result for a single criterion
interface PsAgentEvalCriterionResult {
  criterionUuid: string;
  score: number;
  feedback: string;
}

interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

// Configuration for a single evaluation criterion
interface PsAgentEvalCriterionConfig {
  uuid: string;
  name: string;
  description: string;
  weight: number;
  scoringGuidelines: string;
  allOurIdeasGroupId?: number;
  yourPrioritiesGroupId?: number;
}

interface PsBaseModelReturnParameters {
  tokensIn: number;
  tokensOut: number;
  content: string;
  cachedInTokens?: number;
  reasoningTokens?: number;
  audioTokens?: number;
  toolCalls?: ToolCall[];
}

// Evaluation configuration for an agent class
interface PsAgentEvalConfig {
  criteria: PsAgentEvalCriterionConfig[];
  minimumOverallScore: number;
  evaluationFrequency: "daily" | "weekly" | "monthly" | "onDemand";
  autoEvaluate: boolean;
}

// Table name: "ps_agent_evals" - ADD
interface PsAgentEvalAttributes extends PsBaseModelClassNoUuid {
  agent_id: number;
  overall_score: number;
  results: PsAgentEvalCriterionResult[];
  notes: string;
}

interface PsBaseModelPriceConfiguration {
  costInTokensPerMillion: number;
  costOutTokensPerMillion: number;
  costInCachedContextTokensPerMillion: number;
  longContextCostInTokensPerMillion?: number;
  longContextCostInCachedContextTokensPerMillion?: number;
  longContextCostOutTokensPerMillion?: number;
  longContextTokenThreshold?: number;
  currency: string;
}

interface PsEloRateable {
  eloRating?: number;
}

interface PsAiModelConfiguration {
  type: import("./aiModelTypes.js").PsAiModelType;
  modelSize:  import("./aiModelTypes.js").PsAiModelSize;
  model: string;
  provider: string;
  active: boolean;
  prices: PsBaseModelPriceConfiguration;
  maxTokensOut: number;
  maxContextTokens?: number;
  deploymentName?: string;
  endpoint?: string;
  defaultTemperature: number;
  limitTPM?: number;
  limitRPM?: number;
  timeoutMs?: number;
}

// tablename "ps_ai_models"
interface PsAiModelAttributes extends PsBaseModelClass {
  name: string;
  organization_id: number;
  configuration: PsAiModelConfiguration;
}

interface PsBaseApiPriceAdapter {
  unitType: string;
  pricePerUnit: number;
  currency: string;
  formula?: string;
}

// tablename "ps_external_apis"
interface PsExternalApiAttributes extends PsBaseModelClass {
  type: string;
  organization_id: number;
  priceAdapter: PsBaseApiPriceAdapter;
}

// tablename "ps_model_usage"
interface PsModelUsageAttributes extends PsBaseModelClassNoUuid {
  model_id: number;
  token_in_count: number;
  token_out_count: number;
  token_in_cached_context_count?: number;
  long_context_token_in_count?: number;
  long_context_token_in_cached_context_count?: number;
  token_out_reasoning_count?: number;
  token_out_audio_count?: number;
  token_out_image_count?: number;
  long_context_token_out_count?: number;
  long_context_token_out_reasoning_count?: number;
  long_context_token_out_audio_count?: number;
  long_context_token_out_image_count?: number;
  agent_id?: number;
  connector_id?: number;
}

// tablename "ps_external_api_usage"
interface PsExternalApiUsageAttributes extends PsBaseModelClassNoUuid {
  external_api_id: number;
  call_count: number;
  agent_id: number; // or
  connector_id: number; // or
}

interface PsPairWiseVoteResults {
  wonItemIndex: number | undefined;
  lostItemIndex: number | undefined;
  subProblemIndex: number | undefined;
}

interface PsSearchResultItem extends PsEloRateable {
  title: string;
  originalPosition: number;
  description: string;
  url: string;
  date: string;
  //TODO: Depricated
  link?: string;
  //TODO: Depricated
  position?: number;
}

type SearchResultItem = PsSearchResultItem[];

interface PsSearchOptions {
  before?: string;
  after?: string;
  /**
   * Relative date restriction like `d7` for last 7 days
   * according to Google Custom Search API `dateRestrict` parameter.
   */
  dateRestrict?: string;
  /**
   * Absolute date range in the format `date:r:YYYYMMDD:YYYYMMDD`
   * used with the Google Custom Search API `sort` parameter.
   */
  sort?: string;
}

interface PsAgentBaseMemoryData {
  startTime?: number;
}

interface PsAgentStatus {
  state: "running" | "paused" | "stopped" | "error" | "completed";
  progress: number;
  messages: string[];
  lastUpdated: number;
  details?: Record<string, any>;
}

interface PsSimpleAgentMemoryData extends PsAgentMemoryData {
  groupId: number;
  lastSavedAt?: number;
  currentStage?: any;
  stages?: Record<any, any>;
  currentStageError?: string | undefined;
  totalCost?: number;
}

interface PsAgentMemoryData extends PsAgentBaseMemoryData {
  agentId: number;
  connectors?: PsConnectorsConfig;
  structuredAnswersOverrides?: YpStructuredAnswer[];
}

interface PsModelTokenUsage {
  modelId: number;
  tokensIn: number;
  tokensOut: number;
  contextCacheTokensIn?: number;
  contextCacheTokensOut?: number;
}

interface PsAgentClassAttributesConfiguration {
  category: import("./agentCategories.js").PsAgentClassCategories;
  subCategory: string;
  description: string;
  queueName: string;
  imageUrl: string;
  iconName: string;
  capabilities: string[];
  defaultStructuredQuestions?: YpStructuredQuestionData[];
  requestedAiModelSizes: import("./aiModelTypes.js").PsAiModelSize[];
  questions: YpStructuredQuestionData[];
  supportedConnectors: import("./connectorTypes.js").PsConnectorClassTypes[];
  evalConfig?: PsAgentEvalConfig;
  hasPublicAccess: boolean;
}

// tablename "ps_agent_classes"
interface PsAgentClassAttributes extends PsBaseModelClass {
  class_base_id: string;
  name: string;
  version: number;
  configuration: PsAgentClassAttributesConfiguration;
  available: boolean;
}

interface PsAgentModelUsageEstimate {
  modelId: number;
  tokenInCount?: number;
  tokenOutCount?: number;
  tokenInCachedContextCount?: number;
  timestamp: number;
}

interface PsAgentApiUsageEstimate {
  externalApiId: number;
  callCount: number;
  timestamp: number;
}

interface PsBaseNodeConfiguration {
  modelUsageEstimates?: PsAgentModelUsageEstimate[];
  apiUsageEstimates?: PsAgentApiUsageEstimate[];
  graphPosX: number;
  graphPosY: number;
  maxTokensOut?: number;
  temperature?: number;
  answers?: YpStructuredAnswer[];
  name: string;
}

interface PsBaseNodeInstance extends PsBaseModelClass {
  class_id: number;
  group_id: number;
  User?: YpUserData;
  Group?: YpGroupData;
  ApiUsage?: PsExternalApiUsageAttributes[];
  ModelUsage?: PsModelUsageAttributes[];
  ExternalApis?: PsExternalApiAttributes[];
  configuration: PsBaseNodeConfiguration;
}

type PsAgentsNodeType = "agent" | "connector";

interface PsAgentConnectorsBaseConfiguration extends PsBaseNodeConfiguration {
  name: string;
  permissionNeeded: PsAgentConnectorPermissionTypes;
  [key: string]: any;
}

// tablename "ps_agents"
interface PsAgentAttributes extends PsBaseNodeInstance {
  Class?: PsAgentClassAttributes;
  parent_agent_id?: number;
  parentAgent?: PsAgentAttributes;
  SubAgents?: PsAgentAttributes[]; // through a join table
  InputConnectors?: PsAgentConnectorAttributes[];
  OutputConnectors?: PsAgentConnectorAttributes[];
  AiModels?: PsAiModelAttributes[];
  Evals?: PsAgentEvalAttributes[];
  configuration: any; //TODO: Define the configuration
}

// tablename "ps_agent_connectors"
interface PsAgentConnectorAttributes extends PsBaseNodeInstance {
  User?: YpUserData;
  Group?: YpGroupData;
  Class?: PsAgentConnectorClassAttributes;
  configuration: PsAgentConnectorsBaseConfiguration;
}

interface PsAgentRegistryConfiguration {
  supportedAgents: import("./dbModels/agentClass.js").PsAgentClass[];
}

// tablename "ps_agent_registries"
interface PsAgentRegistryAttributes extends PsBaseModelClass {
  Agents?: PsAgentClassAttributes[];
  Connectors?: PsAgentConnectorClassAttributes[];
  configuration?: PsAgentRegistryConfiguration;
}

interface PsAgentConnectorConfiguration {
  name: string;
  classType: import("./connectorTypes.js").PsConnectorClassTypes;
  description: string;
  imageUrl: string;
  iconName: string;
  questions: YpStructuredQuestionData[];
  hasPublicAccess: boolean;
}

// tablename "ps_agent_connector_classes"
interface PsAgentConnectorClassAttributes extends PsBaseModelClass {
  name: string;
  class_base_id: string;
  version: number;
  available: boolean;
  configuration: PsAgentConnectorConfiguration;
  created_at: Date;
  updated_at: Date;
}

type PsAgentConnectorPermissionTypes = "read" | "write" | "readWrite" | "admin";

interface PsAgentAuditLogDetails {
  description: string;
}

// tablename "ps_agent_audit_logs"
interface PsAgentAuditLogAttributes extends PsBaseModelClassNoUuid {
  agent_id: number; // or
  connector_id: number; // or
  action: string;
  details?: PsAgentAuditLogDetails;
}

interface PsAgentStartJobData {
  agentId: number;
  userId: number;
  action: "start" | "pause" | "stop";
  structuredAnswersOverrides?: Array<YpStructuredAnswer>;
}


interface PsModelRateLimitTracking {
  [modelName: string]: {
    requests: Array<{ timestamp: number }>;
    tokens: Array<{ count: number; timestamp: number }>;
  };
}

type PsAgentClassCreationAttributes = Omit<
  PsAgentClassAttributes,
  "id" | "uuid" | "created_at" | "updated_at"
>;

type PsAgentConnectorClassCreationAttributes = Omit<
  PsAgentConnectorClassAttributes,
  "id" | "uuid" | "created_at" | "updated_at"
>;

interface PsAgentCostResults {
  agentCosts: object;
  totalCost: string;
}

interface PsDetailedAgentCostResults {
  createdAt: Date;
  agentName: string;
  aiModelName: string;
  tokenInCount: number;
  tokenInCachedContextCount: number;
  longContextTokenInCount: number;
  longContextTokenOutCount: number;
  longContextTokenInCachedContextCount: number;
  tokenOutCount: number;
  costIn: number;
  costOut: number;
  totalCost: number;
  costInNormal: number;
  costInCached: number;
  costInLong: number;
  costInCachedLong: number;
  costOutNormal: number;
  costOutLong: number;
}

/* Examples of structured questions for agent classes (for AI programmers)

"googleDocsQuestions": [
  {
    "uniqueId": "name",
    "text": "Name",
    "type": "textField",
    "maxLength": 200,
    "required": false
  },
  {
    "uniqueId": "googleDocsId",
    "text": "Document ID",
    "type": "textField",
    "maxLength": 200,
    "required": false
  },
  {
    "uniqueId": "googleServiceAccount",
    "text": "ServiceAccount JSON",
    "type": "textArea",
    "rows": 10,
    "required": false
  }
] as YpStructuredQuestionData[]

"discordQuestions": [
  {
    "uniqueId": "name",
    "text": "Name",
    "type": "textField",
    "maxLength": 200,
    "required": false
  },
  {
    "uniqueId": "discordBotToken",
    "text": "Bot Token",
    "type": "textField",
    "maxLength": 200,
    "required": false
  },
  {
    "uniqueId": "discordChannelName",
    "text": "Discord Channel Name",
    "type": "textField",
    "maxLength": 200,
    "required": false
  }
] as YpStructuredQuestionData[]

"yourPrioritiesQuestions": [
  {
    "uniqueId": "name",
    "text": "Name",
    "type": "textField",
    "maxLength": 200,
    "required": false
  },
  {
    "uniqueId": "user_id",
    "text": "User ID",
    "type": "textField",
    "maxLength": 200,
    "required": false
  },
  {
    "uniqueId": "userKey",
    "text": "User Key",
    "type": "textField",
    "maxLength": 200,
    "required": false
  },
  {
    "uniqueId": "group_id",
    "text": "Group ID",
    "type": "textField",
    "maxLength": 200,
    "required": false
  }
] as YpStructuredQuestionData[]

"rootCausesQuestions": [
  {
    "uniqueId": "name",
    "text": "Name",
    "type": "textField",
    "maxLength": 200,
    "required": false
  },
  {
    "uniqueId": "problemStatement",
    "text": "Problem Statement",
    "type": "textArea",
    "rows": 5,
    "maxLength": 2500,
    "required": false
  },
  {
    "uniqueId": "rankingInstructions",
    "text": "Ranking Instructions",
    "type": "textArea",
    "rows": 3,
    "maxLength": 1000,
    "required": false
  },
  {
    "uniqueId": "howManySearchQueries",
    "text": "How many search queries",
    "type": "textField",
    "maxLength": 200,
    "subType": "number",
    "required": false
  },
  {
    "uniqueId": "percentToUseSearchQueries",
    "text": "% of top search queries to use",
    "type": "textField",
    "maxLength": 200,
    "subType": "number",
    "required": false
  },
  {
    "uniqueId": "percentToUseSearchResults",
    "text": "% of top search results to use",
    "type": "textField",
    "maxLength": 200,
    "subType": "number",
    "required": false
  }
] as YpStructuredQuestionData[]

// Example of a Connector Class

"googleDocsConnectorClass": {
  "id": 1,
  "name": "Google Docs",
  "uuid": "1",
  "version": 1,
  "created_at": "2024-06-27T00:00:00Z",
  "updated_at": "2024-06-27T00:00:00Z",
  "user_id": 1,
  "available": true,
  "configuration": {
    "description": "Connector for Google Docs",
    "imageUrl": "https://aoi-storage-production.citizens.is/ypGenAi/community/1/339c8468-eb12-4167-a719-606bde321dc2.png",
    "iconName": "docs",
    "questions": googleDocsQuestions
  }
}

// Example of an Agent Class
"smarterCrowdsourcingAgentClass": {
  "id": 1,
  "version": 1,
  "name": "Smarter Crowdsourcing Agent",
  "uuid": "1",
  "user_id": 1,
  "created_at": "2024-06-27T00:00:00Z",
  "updated_at": "2024-06-27T00:00:00Z",
  "available": true,
  "configuration": {
    "description": "An agent for running the Smarter Crowdsourcing process",
    "imageUrl": "https://aoi-storage-production.citizens.is/ypGenAi/community/1/6d4368ce-ecaf-41ab-abb3-65ceadbdb2a6.png",
    "iconName": "smarter_crowdsourcing",
    "assistantSystemInstructions": "Explain the process",
    "capabilities": ["research", "analysis"],
    "inputJsonInterface": "{}",
    "outputJsonInterface": "{}",
    "questions": rootCausesQuestions // Just an example
    supportedConnectors: []
  }
}

*/
