import { YpServerApi } from '../@yrpri/common/YpServerApi.js';

export class LtpServerApi extends YpServerApi {
  constructor(urlPath: string = '/api') {
    super();
    this.baseUrlPath = urlPath;
  }

  public async getCrt(id: string): Promise<CrtResponse> {
    return (await this.fetchWrapper(
      this.baseUrlPath + `/crt/${id}`
    )) as unknown as CrtResponse;
  }

  public createTree(crt: LtpCurrentRealityTreeData): any {
    return this.fetchWrapper(
      this.baseUrlPath + `/crt`,
      {
        method: 'POST',
        body: JSON.stringify(crt),
      },
      false
    );
  }

  public createDirectCauses(parentNodeId: string): any {
    return this.fetchWrapper(
      this.baseUrlPath + `/crt/${parentNodeId}/createDirectCauses`,
      {
        method: 'POST',
        body: JSON.stringify({}),
      },
      false
    );
  }
}
