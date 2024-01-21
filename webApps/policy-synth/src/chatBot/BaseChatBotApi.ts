import { YpServerApi } from '../@yrpri/common/YpServerApi.js';

export class BaseChatBotServerApi extends YpServerApi {
  baseLtpPath = '/ltp/crt/';
  constructor(urlPath: string = '/api') {
    super();
    this.baseUrlPath = urlPath;
  }

}
