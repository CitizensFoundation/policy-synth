import { YpServerApi } from "@yrpri/webapp/common/YpServerApi";
import { YpAppUser } from "@yrpri/webapp/yp-app/YpAppUser";

export class PsAppUser extends YpAppUser {
  constructor(serverApi: YpServerApi, skipRegularInit = false) {
    super(serverApi, true);
  }
}