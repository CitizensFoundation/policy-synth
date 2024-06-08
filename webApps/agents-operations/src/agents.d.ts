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
  title?: string;
  user: YpUserData;
  group: YpGroupData;
  costs: PsInstanceCost[];
  configurationAnswers: YpStructuredAnswer[];
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
}

interface PsAgentConnectorInstance extends PsBaseNodeInstance {
  class: PsAgentConnectorClass;
  permissionNeeded: PsAgentConnectorPermissionTypes;
  configurationAnswers: YpStructuredAnswer[];
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
}

type PsAgentConnectorPermissionTypes = "read" | "write" | "readWrite" | "admin";


