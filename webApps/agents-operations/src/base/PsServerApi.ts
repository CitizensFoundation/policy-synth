import { YpServerApi } from "@yrpri/webapp/common/YpServerApi";

export class PsServerApi extends YpServerApi {
  constructor(urlPath: string = '/api') {
    super();
    this.baseUrlPath = urlPath;
  }

  public async getProject(
    id: number,
    tempPassword?: string,
    forceGetBackupForProject?: string
  ): Promise<CpsBootResponse> {
    return (await this.fetchWrapper(
      this.baseUrlPath +
        `/projects/${id}${forceGetBackupForProject ? `/new` : ``}${
          tempPassword ? `?trm=${tempPassword}` : ''
        }`
    )) as unknown as CpsBootResponse;
  }

  /*
  public getEarl(earlName: string): AoiEarlResponse {
    return this.fetchWrapper(
      this.baseUrlPath + `/earls/${earlName}.json`
    ) as unknown as AoiEarlResponse;
  }

  public getSurveyResults(earlName: string): AoiResultData[] {
    return this.fetchWrapper(
      this.baseUrlPath + `/questions/${earlName}/results.json`
    ) as unknown as AoiResultData[];
  }

  getSurveyAnalysis(
    earlName: string,
    analysisIndex: number,
    analysisTypeIndex: number
  ): AnalysisTypeData {
    return this.fetchWrapper(
      this.baseUrlPath +
        `/questions/${earlName}/${analysisIndex}/${analysisTypeIndex}/analysis.json`
    ) as unknown as AnalysisTypeData;
  }

  public submitIdea(questionId: number, newIdea: string): AoiAddIdeaResponse {
    return this.fetchWrapper(
      this.baseUrlPath + `/questions/${questionId}/add_idea.js`,
      {
        method: 'POST',
        body: JSON.stringify({ new_idea: newIdea }),
      },
      false
    ) as unknown as AoiAddIdeaResponse;
  }

  public postVote(
    questionId: number,
    promptId: number,
    locale: string,
    body: AoiVoteData
  ): AoiVoteResponse {
    const url = new URL(
      `${window.location.protocol}//${window.location.host}${this.baseUrlPath}/questions/${questionId}/prompts/${promptId}/votes.js?locale=${locale}`
    );

    Object.keys(window.psAppGlobals.originalQueryParameters).forEach(key => {
      if (key.startsWith('utm_')) {
        url.searchParams.append(
          key,
          window.psAppGlobals.originalQueryParameters[key]
        );
      }
    });

    const browserId = window.appUser.getBrowserId();
    const browserFingerprint = window.appUser.browserFingerprint;
    const browserFingerprintConfidence = window.appUser.browserFingerprintConfidence;

    url.searchParams.append("checksum_a", browserId);
    url.searchParams.append("checksum_b", browserFingerprint);
    url.searchParams.append("checksum_c", browserFingerprintConfidence.toString());

    return this.fetchWrapper(
      url.toString(),
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
      false
    ) as unknown as AoiVoteResponse;
  }

  public postVoteSkip(
    questionId: number,
    promptId: number,
    locale: string,
    body: AoiVoteSkipData
  ): AoiVoteResponse {
    return this.fetchWrapper(
      this.baseUrlPath +
        `/questions/${questionId}/prompts/${promptId}/skip.js?locale=${locale}`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
      false
    ) as unknown as AoiVoteResponse;
  }
  */
}
