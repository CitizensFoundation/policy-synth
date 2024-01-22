import { YpAppUser, YpServerApi } from "@yrpri/webapp";

export class PsAppUser extends YpAppUser {
  constructor(serverApi: YpServerApi, skipRegularInit = false) {
    super(serverApi, true);
  }
}