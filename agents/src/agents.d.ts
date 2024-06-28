interface YpStructuredQuestionData {
  uniqueId?: string;
  text: string;
  html?: string;
  type?: string;
  subType?: string;
  value?: string | number | boolean;
  maxLength?: number;
  required?: boolean;
  rows?: number;
  pattern?: string;
  charCounter?: boolean;
  richTextAllowed?: boolean;
  segmentName?: string;
  subTitle?: string;
  halfWidthDesktop?: boolean;
  extraTopMargin?: boolean;
  lessBottomMargin?: boolean;
}

interface YpStructuredAnswer {
  uniqueId: string;
  value: string | boolean | number;
}

interface PsBaseModelClass {
  id: number;
  uuid: string;
  user_id: number;
  created_at: Date;
  updated_at: Date;
}

interface PsBaseModelClassNoUuid extends Omit<PsBaseModelClass, 'uuid'> {}

interface PsAiModelConfig {
  apiKey: string;
  modelName?: string;
  maxTokensOut?: number;
  temperature?: number;
};

interface PsAzureAiModelConfig extends PsAiModelConfig {
  endpoint: string;
  deploymentName: string;
};

interface PsOpenAiModelConfig extends PsAiModelConfig {
  projectId?: string;
};

// Evaluation result for a single criterion
interface PsAgentEvalCriterionResult {
  criterionUuid: string;
  score: number;
  feedback: string;
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

// Evaluation configuration for an agent class
interface PsAgentEvalConfig {
  criteria: PsAgentEvalCriterionConfig[];
  minimumOverallScore: number;
  evaluationFrequency: 'daily' | 'weekly' | 'monthly' | 'onDemand';
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
  costInCachedContextTokensPerMillion?: number;
  currency: string;
}

enum PsAiModelType {
  Embedding = "embedding",
  Text = "text",
  MultiModal = "multiModal",
  Audio = "audio",
  Video = "video",
  Image = "image"
}

interface PsAiModelConfiguration {
  type: PsAiModelType;
  provider: string;
  prices: PsBaseModelPriceConfiguration;
  maxTokensOut: number;
  deploymentName?: string;
  endpoint?: string;
  defaultTemperature: number;
  limitTPM?: number;
  limitRPM?: number;
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

interface PsAgentBaseMemoryData {
  startTime?: number;
}

interface PsAgentStatus {
  state: 'processing' | 'paused' | 'error' | 'completed';
  progress: number;
  messages: string[];
  lastUpdated: number;
  details?: Record<string, any>;
}

interface PsSimpleAgentMemoryData extends PsAgentMemoryData {
  groupId: number;
  communityId: number;
  domainId: number;
  aiModelProvider?: string;
  aiModelName?: string;
  lastSavedAt?: number;
  currentStage: any;
  stages: Record<any, PsSimpleStagesData>;
  currentStageError?: string | undefined;
  totalCost: number;
}

interface PsAgentMemoryData extends PsAgentBaseMemoryData {
  agentId: number;
  status: PsAgentStatus;
}

interface PsModelTokenUsage {
  modelId: number;
  tokensIn: number;
  tokensOut: number;
  contextTokensIn?: number;
}

interface PsAgentClassAttributesConfiguration {
  description: string;
  queueName: string;
  imageUrl: string;
  iconName: string;
  assistantSystemInstructions: string;
  capabilities: string[];
  inputJsonInterface: string;
  outputJsonInterface: string;
  questions: YpStructuredQuestionData[];
  supportedConnectors: PsBaseAgentConnectorClass[];
  evalConfig?: PsAgentEvalConfig;
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

enum PsAgentsNodeType {
  Agent = "agent",
  Connector = "connector",
}

interface PsAgentConnectorsBaseConfiguration extends PsBaseNodeConfiguration {
  name: string;
  permissionNeeded: PsAgentConnectorPermissionTypes;
}

// tablename "ps_agents"
interface PsAgentAttributes extends PsBaseNodeInstance {
  Class?: PsAgentClassAttributes;
  parent_agent_id?: number;
  parentAgent?: PsAgentAttributes;
  SubAgents?: PsAgentAttributes[]; // through a join table
  Connectors?: PsAgentConnectorAttributes[]; // through a join table
  AiModels?: PsAiModelAttributes[];
  Evals?: PsAgentEvalAttributes[]; // ADDED
  configuration: PsAgentBaseConfiguration;
}

// tablename "ps_agent_connectors"
interface PsAgentConnectorAttributes extends PsBaseNodeInstance {
  User?: YpUserData;
  Group?: YpGroupData;
  Class?: PsAgentConnectorClassAttributes;
  configuration: PsAgentConnectorsBaseConfiguration;
}

interface PsAgentRegistryConfiguration {
  supportedAgents: PsBaseAgentClass[];
}

// tablename "ps_agent_registries"
interface PsAgentRegistryAttributes extends PsBaseModelClass {
  Agents?: PsAgentClassAttributes[];
  Connectors?: PsAgentConnectorClassAttributes[];
  configuration?: PsAgentRegistryConfiguration;
}

interface PsAgentConnectorConfiguration {
  description: string;
  imageUrl: string;
  iconName: string;
  questions: YpStructuredQuestionData[];
}

// tablename "ps_agent_connector_classes"
interface PsAgentConnectorClassAttributes extends PsBaseModelClass {
  name: string;
  version: number;
  available: boolean;
  configuration: PsAgentConnectorConfiguration;
}

enum PsAgentConnectorPermissionTypes {
  Read = "read",
  Write = "write",
  ReadWrite = "readWrite",
  Admin = "admin",
}

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

interface YpGroupPrivateAccessConfiguration {
  aiModelId?: number;
  externalApiId?: number;
  projectId?: string;
  apiKey: string;
}

// tablename "groups"
interface YpGroupData {
  id: number;
  name: string;
  user_id: number;
  private_access_configuration: YpGroupPrivateAccessConfiguration[];
  created_at: Date;
  updated_at: Date;
}

// tablename "users"
interface YpUserData {
  id: number;
  name: string;
  email: string;
  created_at: Date;
  updated_at: Date;
}

// tablename "organizations"
interface YpOrganizationsData  {
  id: number;
  user_id: number;
  name: string;
  type: string;
  created_at: Date;
  updated_at: Date;
  configuration: any;
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