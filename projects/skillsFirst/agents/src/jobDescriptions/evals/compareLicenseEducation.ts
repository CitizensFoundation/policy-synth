import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import { PsConnectorFactory } from "@policysynth/agents/connectors/base/connectorFactory.js";
import { PsBaseSheetConnector } from "@policysynth/agents/connectors/base/baseSheetConnector.js";
import {
  PsAiModelType,
  PsAiModelSize,
} from "@policysynth/agents/aiModelTypes.js";
import { PsAgentClassCategories } from "@policysynth/agents/agentCategories.js";
import { PsConnectorClassTypes } from "@policysynth/agents/connectorTypes.js";

/** Row from the first sheet */
interface ProfessionRow {
  profession: string;
  degree: string;
}

/** Row from the second sheet */
interface JobRow {
  name: string;
  educationRequirement: string;
}

/** Result returned by the LLM */
interface LicenseComparisonResult {
  profession: string;
  wvuSheetEducationRequirement: string;
  skillsFirstEducationRequirement?: string;
  deepResearchEducationRequirement?: string;
  matchedJobName?: string;
  explanation: string;
  isLikelyMatchingEducationRequirements: boolean;
}

/** Row from the deep research sheet */
interface DeepResearchRow {
  name: string;
  degreeStatus: string;
}

export class CompareLicenseEducationAgent extends PolicySynthAgent {
  declare memory: JobDescriptionMemoryData & {
    results?: LicenseComparisonResult[];
    llmErrors?: string[];
  };

  private sheet1Connector: PsBaseSheetConnector;
  private sheet2Connector: PsBaseSheetConnector;
  private sheet3Connector: PsBaseSheetConnector;
  private outputConnector: PsBaseSheetConnector;

  private sheet1Name: string;
  private sheet2Name: string;
  private sheet3Name: string;
  private outputSheetName: string;

  private readonly maxRows = 4500;
  private readonly chunkSize = 200;

  private static readonly COMPARE_LICENSE_EDUCATION_CLASS_BASE_ID =
    "ab187e9c-fb73-42ec-9c08-87feee4d7c24";
  private static readonly COMPARE_LICENSE_EDUCATION_CLASS_VERSION = 1;

  constructor(
    agent: PsAgent,
    memory: any,
    startProgress: number,
    endProgress: number
  ) {
    super(agent, memory, startProgress, endProgress);

    const inputs = PsConnectorFactory.getAllConnectors(
      this.agent,
      this.memory,
      PsConnectorClassTypes.Spreadsheet,
      true
    ) as PsBaseSheetConnector[];

    if (inputs.length < 3) {
      throw new Error("At least three spreadsheet connectors are required");
    }
    this.sheet1Connector = inputs[0];
    this.sheet2Connector = inputs[1];
    this.sheet3Connector = inputs[2];

    this.outputConnector = PsConnectorFactory.getConnector(
      this.agent,
      this.memory,
      PsConnectorClassTypes.Spreadsheet,
      false
    ) as PsBaseSheetConnector;

    if (!this.outputConnector) {
      throw new Error("Output spreadsheet connector not found");
    }

    this.sheet1Name = this.getConfig("sheet1Name", "Sheet1");
    this.sheet2Name = this.getConfig("sheet2Name", "Sheet2");
    this.sheet3Name = this.getConfig("sheet3Name", "LicenceDegreesDeepResearch");
    this.outputSheetName = this.getConfig("outputSheetName", "Comparison");

    if (!this.memory.results) this.memory.results = [];
    if (!this.memory.llmErrors) this.memory.llmErrors = [];
  }

  override get reasoningEffort(): "low" | "medium" | "high" {
    return "high";
  }

  override get modelTemperature(): number {
    return 0.0;
  }

  override get maxModelTokensOut(): number {
    return 20000;
  }

  static getAgentClass(): PsAgentClassCreationAttributes {
    return {
      class_base_id: this.COMPARE_LICENSE_EDUCATION_CLASS_BASE_ID,
      user_id: 0,
      name: "Compare License Education Agent",
      version: this.COMPARE_LICENSE_EDUCATION_CLASS_VERSION,
      available: true,
      configuration: {
        category: PsAgentClassCategories.DataAnalysis,
        subCategory: "compareLicenseEducation",
        hasPublicAccess: false,
        description:
          "Compares profession degree requirements with job description education requirements across two sheets",
        queueName: "COMPARE_LICENSE_EDUCATION",
        imageUrl:
          "https://aoi-storage-production.citizens.is/ypGenAi/community/1/71844202-56ce-4139-88e2-1cfcab0dd59f.png",
        iconName: "compare_license_education",
        capabilities: ["analysis", "text processing"],
        requestedAiModelSizes: [
          PsAiModelSize.Small,
          PsAiModelSize.Medium,
          PsAiModelSize.Large,
        ],
        supportedConnectors: [] as PsConnectorClassTypes[],
        questions: this.getConfigurationQuestions(),
      },
    };
  }

  static getConfigurationQuestions(): YpStructuredQuestionData[] {
    return [
      {
        uniqueId: "sheet1Name",
        type: "textField",
        value: "Sheet1",
        required: true,
        text: "Name of the first sheet",
      },
      {
        uniqueId: "sheet2Name",
        type: "textField",
        value: "Sheet2",
        required: true,
        text: "Name of the second sheet",
      },
      {
        uniqueId: "sheet3Name",
        type: "textField",
        value: "LicenceDegreesDeepResearch",
        required: true,
        text: "Name of the deep research sheet",
      },
      {
        uniqueId: "outputSheetName",
        type: "textField",
        value: "Comparison",
        required: true,
        text: "Name of the output sheet",
      },
    ];
  }

  /**
   * Reads profession and degree columns from the first sheet. Duplicates are
   * filtered based on the profession value.
   */
  private async readWvuSheetRows(
    connector: PsBaseSheetConnector,
    sheetName: string
  ): Promise<ProfessionRow[]> {
    const range = `${sheetName}!A1:J${this.maxRows}`;
    const rows = await connector.getRange(range);
    if (!rows || rows.length === 0) return [];
    const seen = new Set<string>();
    const result: ProfessionRow[] = [];
    for (const r of rows.slice(1)) {
      const profession = (r[3] ?? "").toString().trim();
      if (!profession || seen.has(profession)) continue;
      seen.add(profession);
      const degree = (r[9] ?? "").toString().trim();
      result.push({ profession, degree });
    }
    return result;
  }

  /**
   * Reads job name and education requirement from the second sheet, filtering
   * out rows that do not require a college degree.
   */
  private async readSkillsFirstSheetRows(
    connector: PsBaseSheetConnector,
    sheetName: string
  ): Promise<JobRow[]> {
    const range = `${sheetName}!A1:W${this.maxRows}`;
    const rows = await connector.getRange(range);
    if (!rows || rows.length === 0) return [];
    const result: JobRow[] = [];
    for (const r of rows.slice(1)) {
      const needsCollegeDegree = (r[19] ?? "").toString().toLowerCase();
      const error = (r[13] ?? "").toString().toLowerCase();
      if (error) continue;
      const name = (r[11] ?? "").toString().trim();
      const educationRequirement = (r[20] ?? "").toString().trim();
      result.push({ name, educationRequirement });
    }
    return result;
  }

  /**
   * Reads license name and degree status from the deep research sheet.
   */
  private async readDeepResearchSheetRows(
    connector: PsBaseSheetConnector,
    sheetName: string
  ): Promise<DeepResearchRow[]> {
    const range = `${sheetName}!A1:C${this.maxRows}`;
    const rows = await connector.getRange(range);
    if (!rows || rows.length === 0) return [];
    const result: DeepResearchRow[] = [];
    for (const r of rows.slice(1)) {
      const name = (r[0] ?? "").toString().trim();
      if (!name) continue;
      const degreeStatus = (r[2] ?? "").toString().trim();
      result.push({ name, degreeStatus });
    }
    return result;
  }

  async processWvuComparison() {
    await this.updateRangedProgress(0, "Starting license comparison");

    const skillsFirstSheetRows = await this.readSkillsFirstSheetRows(
      this.sheet2Connector,
      this.sheet2Name
    );

    const wvuSheetRows = await this.readWvuSheetRows(
      this.sheet1Connector,
      this.sheet1Name
    );

    let count = 0;
    for (const row of wvuSheetRows) {
      count++;
      await this.updateRangedProgress(
        (count / wvuSheetRows.length) * 50,
        `Processing row ${count} of ${wvuSheetRows.length}`
      );

      const context = skillsFirstSheetRows
        .map((r) => `${r.name} - ${r.educationRequirement}`)
        .join("\n");

      const prompt =
        `You will be given a profession and its required degree from the WVU Sheet.\n` +
        `You also have a list of job descriptions from Skills First Sheet that require a college degree with their education requirements.\n` +
        `Find the best matching job description from Skills First Sheet by the name of the job.\n` +
        `If none of the job descriptions match, then return none in the fields but with a short explanation.\n` +
        `Return JSON with keys: {
          profession: string,
          wvuSheetEducationRequirement: string,
          matchedJobName: string,
          skillsFirstEducationRequirement: string,
          isLikelyMatchingEducationRequirements: boolean,
          explanation: string
        }`;

      const userMessage = `<SkillsFirstSheetRows>\n${context}\n</SkillsFirstSheetRows>\n\n<WvuSheetProfessionAndDegreeRequirement>${row.profession} - ${row.degree}</WvuSheetProfessionAndDegreeRequirement>\n`;

      //console.log(userMessage);

      const messages = [
        this.createSystemMessage(`${prompt}`),
        this.createHumanMessage(userMessage),
      ];

      try {
        const result = (await this.callModel(
          PsAiModelType.TextReasoning,
          PsAiModelSize.Large,
          messages
        )) as LicenseComparisonResult;
        (this.memory.results ?? []).push({
          ...result,
          wvuSheetEducationRequirement: row.degree,
        });
      } catch (err: any) {
        const msg = `LLM error for profession ${row.profession}: ${err.message}`;
        this.logger.error(msg);
        (this.memory.llmErrors ?? []).push(msg);
      }
    }

    await this.writeResults();
    await this.updateRangedProgress(100, "Comparison complete");

  }

  async processDeepResearchComparison() {
    await this.updateRangedProgress(0, "Starting deep research comparison");

    const deepResearchRows = await this.readDeepResearchSheetRows(
      this.sheet3Connector,
      this.sheet3Name
    );

    console.log(JSON.stringify(deepResearchRows, null, 2).slice(0, 300));

    const wvuSheetRows = await this.readWvuSheetRows(
      this.sheet1Connector,
      this.sheet1Name
    );

    console.log(JSON.stringify(wvuSheetRows, null, 2).slice(0, 300));

    let count = 0;
    for (const row of wvuSheetRows) {
      count++;
      await this.updateRangedProgress(
        (count / wvuSheetRows.length) * 50,
        `Processing row ${count} of ${wvuSheetRows.length}`
      );

      const context = deepResearchRows
        .map((r) => `${r.name} - ${r.degreeStatus}`)
        .join("\n");

      const prompt =
        `You will be given a profession and its required degree from the WVU Sheet.\n` +
        `You also have a list of license degree research results with their degree status.\n` +
        `Find the best matching license from the deep research list by the name.\n` +
        `If "No Degree Found" is coming from the deep research sheet then assume that no higher degree required so either no degree or high school diploma would be a match.\n` +
        `If none of the licenses match, then return none in the fields but with a short explanation.\n` +
        `Return JSON with keys:
        {
          profession: string,
          wvuSheetEducationRequirement: string,
          deepResearchEducationRequirement: string,
          matchedJobName: string,
          isLikelyMatchingEducationRequirements: boolean | null,
          explanation: string
        }`;

      const userMessage = `<LicenceDegreesDeepResearchRows>\n${context}\n</LicenceDegreesDeepResearchRows>\n\n<WvuSheetProfessionAndDegreeRequirement>${row.profession} - ${row.degree}</WvuSheetProfessionAndDegreeRequirement>\n`;

      const messages = [
        this.createSystemMessage(`${prompt}`),
        this.createHumanMessage(userMessage),
      ];

      try {
        const result = (await this.callModel(
          PsAiModelType.TextReasoning,
          PsAiModelSize.Large,
          messages
        )) as LicenseComparisonResult;
        (this.memory.results ?? []).push({
          ...result,
          wvuSheetEducationRequirement: row.degree,
        });
      } catch (err: any) {
        const msg = `LLM error for profession ${row.profession}: ${err.message}`;
        this.logger.error(msg);
        (this.memory.llmErrors ?? []).push(msg);
      }
    }

    await this.writeResults();
    await this.updateRangedProgress(100, "Deep research comparison complete");

  }

  async processReversedDeepResearchComparison() {
    await this.updateRangedProgress(
      0,
      "Starting reversed deep research comparison"
    );

    const deepResearchRows = await this.readDeepResearchSheetRows(
      this.sheet3Connector,
      this.sheet3Name
    );

    const wvuSheetRows = await this.readWvuSheetRows(
      this.sheet1Connector,
      this.sheet1Name
    );

    let count = 0;
    for (const row of deepResearchRows) {
      count++;
      await this.updateRangedProgress(
        (count / deepResearchRows.length) * 50,
        `Processing row ${count} of ${deepResearchRows.length}`
      );

      const context = wvuSheetRows
        .map((r) => `${r.profession} - ${r.degree}`)
        .join("\n");

      const prompt =
        `You will be given a license and its degree status from the deep research sheet.\n` +
        `You also have a list of professions and required degrees from the WVU Sheet.\n` +
        `Find the best matching profession from the WVU Sheet by the name of the license.\n` +
        `If "No Degree Found" is coming from the deep research sheet then assume that no higher degree required so either no degree or high school diploma would be a match.\n` +
        `If none of the professions match, then return none in the fields but with a short explanation.\n` +
        `Return JSON with keys:\n` +
        `  {\n` +
        `    profession: string,\n` +
        `    wvuSheetEducationRequirement: string,\n` +
        `    deepResearchEducationRequirement: string,\n` +
        `    matchedJobName: string,\n` +
        `    isLikelyMatchingEducationRequirements: boolean | null,\n` +
        `    explanation: string\n` +
        `  }`;

      const userMessage = `<WvuSheetRows>\n${context}\n</WvuSheetRows>\n\n<DeepResearchNameAndDegreeStatus>${row.name} - ${row.degreeStatus}</DeepResearchNameAndDegreeStatus>\n`;

      const messages = [
        this.createSystemMessage(`${prompt}`),
        this.createHumanMessage(userMessage),
      ];

      try {
        const result = (await this.callModel(
          PsAiModelType.TextReasoning,
          PsAiModelSize.Large,
          messages
        )) as LicenseComparisonResult;
        (this.memory.results ?? []).push({
          ...result,
          deepResearchEducationRequirement: row.degreeStatus,
        });
      } catch (err: any) {
        const msg = `LLM error for license ${row.name}: ${err.message}`;
        this.logger.error(msg);
        (this.memory.llmErrors ?? []).push(msg);
      }
    }

    await this.writeResults();
    await this.updateRangedProgress(
      100,
      "Reversed deep research comparison complete"
    );

  }

  async process(): Promise<void> {
    await this.updateRangedProgress(0, "Starting license comparison");
    //await this.processWvuComparison();
    //await this.processDeepResearchComparison();
    await this.processReversedDeepResearchComparison();

  }

  /** Writes results to the output sheet in chunks */
  private async writeResults(): Promise<void> {
    await this.outputConnector.addSheetIfNotExists(this.outputSheetName);

    const rows: string[][] = [
      [
        "profession",
        "wvuSheetEducationRequirement",
        "deepResearchEducationRequirement",
        "isLikelyMatchingEducationRequirements",
        "matchedJobName",
        "explanation",
      ],
    ];

    for (const r of this.memory.results ?? []) {
      rows.push([
        r.profession,
        r.wvuSheetEducationRequirement,
        r.deepResearchEducationRequirement ?? "",
        r.isLikelyMatchingEducationRequirements ? "true" : "false",
        r.matchedJobName ?? "",
        r.explanation,
      ]);
    }

    await this.updateSheetInChunks(rows);
  }

  private async updateSheetInChunks(allRows: string[][]): Promise<void> {
    if (allRows.length === 0) return;
    const totalCols = allRows[0].length;
    let rowPointer = 1;

    for (let i = 0; i < allRows.length; i += this.chunkSize) {
      const chunk = allRows.slice(i, i + this.chunkSize);
      const chunkLength = chunk.length;
      const startRow = rowPointer;
      const endRow = rowPointer + chunkLength - 1;
      const endColLetter = this.columnIndexToLetter(totalCols - 1);
      const range = `${this.outputSheetName}!A${startRow}:${endColLetter}${endRow}`;
      await this.outputConnector.updateRange(range, chunk);
      rowPointer += chunkLength;
    }
  }

  private columnIndexToLetter(index: number): string {
    let temp = index;
    let letter = "";
    while (temp >= 0) {
      letter = String.fromCharCode((temp % 26) + 65) + letter;
      temp = Math.floor(temp / 26) - 1;
    }
    return letter;
  }
}
