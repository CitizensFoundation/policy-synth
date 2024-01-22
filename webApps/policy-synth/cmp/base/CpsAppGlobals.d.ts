import { YpAppGlobals } from '@yrpri/webapp';
import { CpsServerApi } from './CpsServerApi.js';
export declare class CpsAppGlobals extends YpAppGlobals {
    originalQueryParameters: any;
    originalReferrer: string;
    questionId: number;
    earlId: number;
    promptId: number;
    earlName: string;
    disableParentConstruction: boolean;
    exernalGoalParamsWhiteList: string | undefined;
    constructor(serverApi: CpsServerApi);
    getEarlName: () => string | null;
    setIds: (e: CustomEvent) => void;
    parseQueryString: () => void;
    getSessionFromCookie: () => string;
    getOriginalQueryString(): string;
    activity: (type: string, object?: any | undefined) => void;
}
//# sourceMappingURL=CpsAppGlobals.d.ts.map