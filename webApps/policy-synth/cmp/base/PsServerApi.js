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
    async getMiddleSolutions(id, subProblemIndex) {
        return (await this.fetchWrapper(this.baseUrlPath + `/projects/${id}/${subProblemIndex}/middle/solutions`));
    }
    async getRawEvidence(id, subProblemIndex, policyTitle) {
        return (await this.fetchWrapper(this.baseUrlPath +
            `/projects/${id}/${subProblemIndex}/${policyTitle}/rawEvidence`));
    }
}
//# sourceMappingURL=PsServerApi.js.map