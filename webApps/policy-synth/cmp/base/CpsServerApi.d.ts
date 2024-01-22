import { YpServerApi } from "@yrpri/webapp";
export declare class CpsServerApi extends YpServerApi {
    constructor(urlPath?: string);
    getProject(id: number, tempPassword?: string, forceGetBackupForProject?: string): Promise<CpsBootResponse>;
    getMiddleSolutions(id: number, subProblemIndex: number): Promise<IEngineSolution[][]>;
    getRawEvidence(id: number, subProblemIndex: number, policyTitle: string): Promise<PSEvidenceRawWebPageData[]>;
}
//# sourceMappingURL=CpsServerApi.d.ts.map