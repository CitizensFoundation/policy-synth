import { YpServerApi } from "@yrpri/webapp/common/YpServerApi";

export class BaseChatBotServerApi extends YpServerApi {
  baseLtpPath = '/ltp/crt/';
  constructor(urlPath: string = '/api') {
    super();
    this.baseUrlPath = urlPath;
  }
}
