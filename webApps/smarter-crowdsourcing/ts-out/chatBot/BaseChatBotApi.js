import { YpServerApi } from "@yrpri/webapp/common/YpServerApi";
export class BaseChatBotServerApi extends YpServerApi {
    constructor(urlPath = '/api') {
        super();
        this.baseLtpPath = '/ltp/crt/';
        this.baseUrlPath = urlPath;
    }
}
//# sourceMappingURL=BaseChatBotApi.js.map