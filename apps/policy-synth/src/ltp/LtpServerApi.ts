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

  public createTree(crt: LtpCurrentRealityTreeData): Promise<LtpCurrentRealityTreeDataNode[]> {
    return this.fetchWrapper(
      this.baseUrlPath + `/crt`,
      {
        method: 'POST',
        body: JSON.stringify(crt),
      },
      false
    ) as Promise<LtpCurrentRealityTreeDataNode[]>;
  }

  public createDirectCauses(parentNodeId: string): Promise<LtpCurrentRealityTreeDataNode[]> {
    return this.fetchWrapper(
      this.baseUrlPath + `/crt/1/createDirectCauses`,
      {
        method: 'POST',
        body: JSON.stringify({
          parentNodeId
        }),
      },
      false
    ) as Promise<LtpCurrentRealityTreeDataNode[]>;
  }
}
