interface PsBaseModelClass {
  id: number; // Internal id and main key and index
  uuid: string; // DataTypes.UUIDV4 used for APIs to access objects
  user_id: number;
  created_at: Date;
  updated_at: Date;
}

interface PsAiModelConfiguration {
  type: string;
  provider: string;
  access?: {
    key?: string;
    projectId?: string;
  };
}

// tablename "ps_ai_models"
interface PsAiModelAttributes extends PsBaseModelClass {
  name: string;
  configuration: PsAiModelConfiguration;
}

interface PsAgentClassAttributesConfiguration {
  description: string;
  imageUrl: string;
  iconName: string;
  assistantSystemInstructions: string;
  capabilities: string[];
  inputJsonInterface: string;
  outputJsonInterface: string;
  questions: YpStructuredQuestionData[];
  supportedConnectors: PsBaseAgentConnectorClass[];
}

// tablename "ps_agent_classes"
interface PsAgentClassAttributes extends PsBaseModelClass {
  name: string;
  version: number;
  configuration: PsAgentClassAttributesConfiguration;
  available: boolean;
}

interface PsBaseNodeConfiguration {
  graphPosX: number;
  graphPosY: number;
}

interface PsBaseNodeInstance extends PsBaseModelClass {
  class_id: number;
  group_id: number;
  User?: YpUserData;
  Group?: YpGroupData;
  ApiCosts?: PsApiCostAttributes[];
  ModelCosts?: PsModelCostAttributes[];
  configuration: PsBaseNodeConfiguration;
}

enum PsAgentsNodeType {
  Agent = "agent",
  Connector = "connector"
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
  Connectors?: PsAgentConnectorAttributes[];  // through a join table
  AiModels?: PsAiModelAttributes[];
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
  Admin = "admin"
}

interface PsBaseModelCostConfiguration {
  costInTokens: number;
  costOutTokens: number;
  currency: string;
}

// tablename "ps_model_cost_classes"
interface PsModelCostClassAttributes extends PsBaseModelClass {
  model_id: string;
  configuration: PsBaseModelCostConfiguration;
}

interface PsBaseApiCostConfiguration {
  unitType: string;
  pricePerUnit: number;
  currency: string;
}

// tablename "ps_api_cost_classes"
interface PsApiCostClassAttributes extends PsBaseModelClass {
  model_id: string;
  configuration: PsBaseApiCostConfiguration;
}

// tablename "ps_model_costs"
interface PsModelCostAttributes extends PsBaseModelClass {
  cost_class_id: number;
  cost: number;
  agent_id: number;
  connector_id: number;
}

// tablename "ps_api_costs"
interface PsApiCostAttributes extends PsBaseModelClass {
  cost_class_id: number;
  cost: number;
  agent_id: number; // or
  connector_id: number; // or
}

interface PsAgentAuditLogDetails {
  description: string;
}

// tablename "ps_agent_audit_logs"
interface PsAgentAuditLogAttributes extends PsBaseModelClass {
  agent_id: number; // or
  connector_id: number; // or
  action: string;
  details?: PsAgentAuditLogDetails;
  timestamp: Date;
}

interface YpGroupConfigurationData {
  aiModels?: { keys?: { [key: string]: string } | undefined } | undefined;
}

// tablename "groups"
interface YpGroupData {
  id: number;
  name: string;
  user_id: number;
  configuration: {
    aiModels?: {
      keys?: {
        [key: string]: string;
      }
    }
  }
}

// tablename "users"
interface YpUserData {
  id: number;
  name: string;
  email: string;
}