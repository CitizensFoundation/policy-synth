import { YpServerApi } from "./@yrpri/common/YpServerApi";
import { YpAppUser } from "./@yrpri/yp-app/YpAppUser";

export class CpsAppUser extends YpAppUser {
  constructor(serverApi: YpServerApi, skipRegularInit = false) {
    super(serverApi, true);
  }
}