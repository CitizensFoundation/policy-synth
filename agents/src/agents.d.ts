interface PsBaseModelClass {
  id: number;
  uuid: string;
  user_id: number;
  created_at: Date;
  updated_at: Date;
}

interface PsBaseModelClassNoUuid extends Omit<PsBaseModelClass, 'uuid'> {}

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
  prices: PsBaseModelPriceConfiguration;
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
  agent_id: number;
  connector_id: number;
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

interface PsAiModelAccessConfiguration {
  aiModelId: string;
  projectId?: string;
  apiKey: string;
}

interface YpPsGroupConfigurationData {
  aiModelAccess: PsAiModelAccessConfiguration[];
}

// tablename "groups"
interface YpGroupData {
  id: number;
  name: string;
  user_id: number;
  configuration: YpPsGroupConfigurationData;
}

// tablename "users"
interface YpUserData {
  id: number;
  name: string;
  email: string;
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
