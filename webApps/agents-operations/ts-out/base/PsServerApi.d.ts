import { YpServerApi } from "@yrpri/webapp/common/YpServerApi";
export declare class PsServerApi extends YpServerApi {
    constructor(urlPath?: string);
    getProject(id: number, tempPassword?: string, forceGetBackupForProject?: string): Promise<CpsBootResponse>;
}
//# sourceMappingURL=PsServerApi.d.ts.map