import { YpAppGlobals } from '@yrpri/webapp/yp-app/YpAppGlobals.js';
import { PsServerApi } from './PsServerApi.js';
export declare class PsAppGlobals extends YpAppGlobals {
    originalQueryParameters: any;
    originalReferrer: string;
    questionId: number;
    earlId: number;
    promptId: number;
    earlName: string;
    disableParentConstruction: boolean;
    exernalGoalParamsWhiteList: string | undefined;
    agentsInstanceRegistry: Map<number, PsAgentInstance>;
    connectorsInstanceRegistry: Map<number, PsAgentConnectorInstance>;
    currentRunningAgentId: number | undefined;
    currentAgentListeners: any[];
    constructor(serverApi: PsServerApi);
    setCurrentRunningAgentId(id: number | undefined): void;
    addCurrentAgentListener(callback: Function): void;
    removeCurrentAgentListener(callback: Function): void;
    notifyCurrentAgentListeners(): void;
    addToAgentsRegistry: (agent: PsAgentInstance) => void;
    addToConnectorsRegistry: (connector: PsAgentConnectorInstance) => void;
    getAgentInstance(agentId: number): PsAgentInstance | undefined;
    getConnectorInstance(connectorId: number): PsAgentConnectorInstance | undefined;
    getEarlName: () => string | null;
    setIds: (e: CustomEvent) => void;
    parseQueryString: () => void;
    getSessionFromCookie: () => string;
    getOriginalQueryString(): string;
    activity: (type: string, object?: any | undefined) => void;
}
//# sourceMappingURL=PsAppGlobals.d.ts.map