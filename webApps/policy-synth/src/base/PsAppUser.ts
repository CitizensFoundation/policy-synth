import { YpServerApi } from "@yrpri/webapp/cmp/common/YpServerApi";
import { YpAppUser } from "@yrpri/webapp/cmp/yp-app/YpAppUser";

export class PsAppUser extends YpAppUser {
  constructor(serverApi: YpServerApi, skipRegularInit = false) {
    super(serverApi, true);
  }
}