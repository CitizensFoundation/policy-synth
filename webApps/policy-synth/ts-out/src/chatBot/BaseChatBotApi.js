import { YpServerApi } from '../@yrpri/common/YpServerApi.js';
export class BaseChatBotServerApi extends YpServerApi {
    constructor(urlPath = '/api') {
        super();
        this.baseLtpPath = '/ltp/crt/';
        this.baseUrlPath = urlPath;
    }
}
//# sourceMappingURL=BaseChatBotApi.js.map