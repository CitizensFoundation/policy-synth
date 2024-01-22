import { YpAppUser, YpServerApi } from "@yrpri/webapp";

export class CpsAppUser extends YpAppUser {
  constructor(serverApi: YpServerApi, skipRegularInit = false) {
    super(serverApi, true);
  }
}