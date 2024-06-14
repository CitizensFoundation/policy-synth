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
    agentsInstanceRegistry: Map<number, PsAgentAttributes>;
    connectorsInstanceRegistry: Map<number, PsAgentConnectorAttributes>;
    currentRunningAgentId: number | undefined;
    currentAgentListeners: any[];
    constructor(serverApi: PsServerApi);
    setCurrentRunningAgentId(id: number | undefined): void;
    addCurrentAgentListener(callback: Function): void;
    removeCurrentAgentListener(callback: Function): void;
    notifyCurrentAgentListeners(): void;
    addToAgentsRegistry: (agent: PsAgentAttributes) => void;
    addToConnectorsRegistry: (connector: PsAgentConnectorAttributes) => void;
    getAgentInstance(agentId: number): PsAgentAttributes | undefined;
    getConnectorInstance(connectorId: number): PsAgentConnectorAttributes | undefined;
    getEarlName: () => string | null;
    setIds: (e: CustomEvent) => void;
    parseQueryString: () => void;
    getSessionFromCookie: () => string;
    getOriginalQueryString(): string;
    activity: (type: string, object?: any | undefined) => void;
}
//# sourceMappingURL=PsAppGlobals.d.ts.map