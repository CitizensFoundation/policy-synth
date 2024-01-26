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
    constructor(serverApi: PsServerApi);
    getEarlName: () => string | null;
    setIds: (e: CustomEvent) => void;
    parseQueryString: () => void;
    getSessionFromCookie: () => string;
    getOriginalQueryString(): string;
    activity: (type: string, object?: any | undefined) => void;
}
//# sourceMappingURL=PsAppGlobals.d.ts.map