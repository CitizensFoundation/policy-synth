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
  configurationAnswers: YpStructuredAnswer[];
  graphPosX: number;
  graphPosY: number;
}

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
}

type PsAgentConnectorPermissionTypes = "read" | "write" | "admin";


