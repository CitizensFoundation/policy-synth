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

/** Simple structure representing a license row */
interface LicenseRow {
  licenseType: string;
  educationRequirement: string;
}

/** Result returned by the LLM */
interface LicenseComparisonResult {
  licenseType: string;
  matchedLicenseType?: string;
  explanation: string;
}

export class CompareLicenseEducationAgent extends PolicySynthAgent {
  declare memory: JobDescriptionMemoryData & {
    results?: LicenseComparisonResult[];
    llmErrors?: string[];
  };

  private sheet1Connector: PsBaseSheetConnector;
  private sheet2Connector: PsBaseSheetConnector;
  private outputConnector: PsBaseSheetConnector;

  private sheet1Name: string;
  private sheet2Name: string;
  private outputSheetName: string;

  private readonly maxRows = 1000;
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

    if (inputs.length < 2) {
      throw new Error("At least two spreadsheet connectors are required");
    }
    this.sheet1Connector = inputs[0];
    this.sheet2Connector = inputs[1];

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
    this.outputSheetName = this.getConfig("outputSheetName", "Comparison");

    if (!this.memory.results) this.memory.results = [];
    if (!this.memory.llmErrors) this.memory.llmErrors = [];
  }

  override get reasoningEffort(): "low" | "medium" | "high" {
    return "high";
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
          "Compares professional license education requirements between two sheets",
        queueName: "COMPARE_LICENSE_EDUCATION",
        imageUrl: "https://aoi-storage-production.citizens.is/ypGenAi/community/1/71844202-56ce-4139-88e2-1cfcab0dd59f.png",
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
        uniqueId: "outputSheetName",
        type: "textField",
        value: "Comparison",
        required: true,
        text: "Name of the output sheet",
      },
    ];
  }

  /** Reads A/B columns and returns LicenseRow objects */
  private async readRows(
    connector: PsBaseSheetConnector,
    sheetName: string
  ): Promise<LicenseRow[]> {
    const range = `${sheetName}!A1:B${this.maxRows}`;
    const rows = await connector.getRange(range);
    if (!rows || rows.length === 0) return [];
    return rows.slice(1).map((r) => ({
      licenseType: (r[0] ?? "").toString().trim(),
      educationRequirement: (r[1] ?? "").toString().trim(),
    }));
  }

  async process(): Promise<void> {
    await this.updateRangedProgress(0, "Starting license comparison");

    const sheet1Rows = await this.readRows(this.sheet1Connector, this.sheet1Name);
    const sheet2Rows = await this.readRows(this.sheet2Connector, this.sheet2Name);

    let count = 0;
    for (const row of sheet1Rows) {
      count++;
      await this.updateRangedProgress(
        (count / sheet1Rows.length) * 50,
        `Processing row ${count} of ${sheet1Rows.length}`
      );

      const context = sheet2Rows
        .map((r) => `${r.licenseType} - ${r.educationRequirement}`)
        .join("\n");

      const prompt = `You will be given a license type and its education requirement from Sheet One.\n` +
        `You also have a list of license types and education requirements from Sheet Two.\n` +
        `Find the best matching license from Sheet Two.\n` +
        `Return JSON with keys: licenseType, matchedLicenseType, explanation.`;

      const messages = [
        this.createSystemMessage(
          `${prompt}\n\n<SheetOneLicense>${row.licenseType} - ${row.educationRequirement}</SheetOneLicense>\n` +
            `<SheetTwoRows>\n${context}\n</SheetTwoRows>`
        ),
      ];

      try {
        const result = (await this.callModel(
          PsAiModelType.TextReasoning,
          PsAiModelSize.Large,
          messages
        )) as LicenseComparisonResult;
        (this.memory.results ?? []).push(result);
      } catch (err: any) {
        const msg = `LLM error for license ${row.licenseType}: ${err.message}`;
        this.logger.error(msg);
        (this.memory.llmErrors ?? []).push(msg);
      }
    }

    await this.writeResults();
    await this.updateRangedProgress(100, "Comparison complete");
  }

  /** Writes results to the output sheet in chunks */
  private async writeResults(): Promise<void> {
    await this.outputConnector.addSheetIfNotExists(this.outputSheetName);

    const rows: string[][] = [
      ["licenseType", "matchedLicenseType", "explanation"],
    ];

    for (const r of this.memory.results ?? []) {
      rows.push([r.licenseType, r.matchedLicenseType ?? "", r.explanation]);
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
