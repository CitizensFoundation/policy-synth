interface PsModelClass {
  id: string;
  name: string;
  type: string;
}

interface PsCostClass {
  id: string;
  modelId: string;
  costInTokens: number;
  costOutTokens: number;
  currency: string;
}

interface PsInstanceCost {
  costClassId: number;
  cost: number;
}

interface PsAgentClass {
  id: number;
  version: number;
  name: string;
  description: string;
  imageUrl: string;
  iconName: string;
  assistantSystemInstructions: string;
  capabilities: string[];
  inputJsonInterface: string;
  outputJsonInterface: string;
  configurationQuestions: YpStructuredQuestionData[];
  supportedConnectors: PsBaseAgentConnectorClass[];
}

interface PsBaseNodeInstance {
  id: number;
  classId: number;
  userId: number;
  groupId: number;
  user: YpUserData;
  group: YpGroupData;
  costs: PsInstanceCost[];
  graphPosX: number;
  graphPosY: number;
}

type PsAgentsNodeType = "agent" | "connector";

interface PsAgentInstance extends PsBaseNodeInstance {
  class: PsAgentClass;
  parentAgentId: number | undefined;
  parentAgent: PsAgentInstance | undefined;
  subAgents: PsAgentInstance[] | undefined;
  connectors: PsAgentConnectorInstance[] | undefined;
  configuration: Record<string, YpStructuredAnswer>;
}

interface PsAgentConnectorInstance extends PsBaseNodeInstance {
  class: PsAgentConnectorClass;
  permissionNeeded: PsAgentConnectorPermissionTypes;
  configuration: Record<string, YpStructuredAnswer>;
}

interface PsAgentRegistry {
  agents: PsBaseAgent[];
}

interface PsAgentConnectorClass {
  id: number;
  name: string;
  description: string;
  version: number;
  imageUrl: string;
  iconName: string;
  configurationQuestions: YpStructuredQuestionData[];
}

type PsAgentConnectorPermissionTypes = "read" | "write" | "readWrite" | "admin";


