import { YpServerApi } from "@yrpri/webapp/common/YpServerApi";
export class PsServerApi extends YpServerApi {
    constructor(urlPath = '/api') {
        super();
        this.baseUrlPath = urlPath;
    }
    async getProject(id, tempPassword, forceGetBackupForProject) {
        return (await this.fetchWrapper(this.baseUrlPath +
            `/projects/${id}${forceGetBackupForProject ? `/new` : ``}${tempPassword ? `?trm=${tempPassword}` : ''}`));
    }
}
//# sourceMappingURL=PsServerApi.js.map