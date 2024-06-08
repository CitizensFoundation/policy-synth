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
    constructor(serverApi: PsServerApi);
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