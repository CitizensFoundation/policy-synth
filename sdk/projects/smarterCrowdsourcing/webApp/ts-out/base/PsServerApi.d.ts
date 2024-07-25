import { YpServerApi } from "@yrpri/webapp/common/YpServerApi";
export declare class PsServerApi extends YpServerApi {
    constructor(urlPath?: string);
    getProject(id: number, tempPassword?: string, forceGetBackupForProject?: string): Promise<CpsBootResponse>;
    getMiddleSolutions(id: number, subProblemIndex: number): Promise<PsSolution[][]>;
    getRawEvidence(id: number, subProblemIndex: number, policyTitle: string): Promise<PSEvidenceRawWebPageData[]>;
}
//# sourceMappingURL=PsServerApi.d.ts.map