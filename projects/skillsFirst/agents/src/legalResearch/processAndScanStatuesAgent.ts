import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import pLimit from "p-limit";
import { PsConnectorFactory } from "@policysynth/agents/connectors/base/connectorFactory.js";
import { PsConnectorClassTypes } from "@policysynth/agents/connectorTypes.js";
import { PsGoogleDriveConnector } from "@policysynth/agents/connectors/drive/googleDrive.js";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import {
  PsAiModelSize,
  PsAiModelType,
} from "@policysynth/agents/aiModelTypes.js";
import { EducationRequirementAnalyzerAgent } from "./educationRequirementAnalyzer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MAX_PARALLEL_CHUNKS = 40;

export class ProcessAndScanStatuesAgent extends PolicySynthAgent {
  declare memory: JobDescriptionMemoryData;
  private driveConnector?: PsGoogleDriveConnector;

  override get maxModelTokensOut(): number {
    return 30000;
  }

  override get modelTemperature(): number {
    return 0.0;
  }

  constructor(agent: PsAgent, memory: JobDescriptionMemoryData) {
    super(agent, memory, 0, 100);
    this.memory = memory;
    const connector = PsConnectorFactory.getConnector(
      this.agent,
      this.memory,
      PsConnectorClassTypes.Drive,
      true
    );
    this.driveConnector =
      connector instanceof PsGoogleDriveConnector ? connector : undefined;
  }

  private get dataPath() {
    return join(__dirname, "../../data", "njStatutes.txt");
  }

  private async loadStatutesText(): Promise<string> {
    if (this.driveConnector) {
      const fileId = this.driveConnector.getConfig("fileId", "");
      if (fileId) {
        try {
          const res = await this.driveConnector.drive.files.get(
            {
              fileId,
              alt: "media",
            },
            { responseType: "arraybuffer" }
          );
          const buffer = Buffer.isBuffer(res.data)
            ? Buffer.from(res.data)
            : Buffer.from(res.data as any);
          return buffer.toString("utf8");
        } catch (err) {
          this.logger.error(`Failed to load statutes from Drive: ${err}`);
        }
      }
    }
    return fs.readFileSync(this.dataPath, "utf8");
  }

  async loadAndScanStatuesIfNeeded(): Promise<void> {
    this.memory.statuteResearch = (this.memory.statuteResearch || {
      chunks: [],
      jobMatches: {},
    }) as StatuteResearchMemory;

    if ((this.memory.statuteResearch?.chunks || []).length) {
      await this.extractJobTitleDegreeInformation();

      return;
    }

    const raw = await this.loadStatutesText();
    const titles = this.splitByTitle(raw);

    for (const { title, text } of titles) {
      const chunks = this.splitIntoChunks(text, 700000);
      const limit = pLimit(MAX_PARALLEL_CHUNKS);
      const tasks = chunks.map((chunkText, i) =>
        limit(async () => {
          const analysis = (await this.callModel(
            PsAiModelType.Text,
            PsAiModelSize.Medium,
            [
              this.createSystemMessage(
                `Determine if the following legal text contains any discussion about jobs or job requirements.
                 Reply only with JSON { "discussesJobs": boolean, "summary": string }`
              ),
              this.createHumanMessage(chunkText),
            ]
          )) as { discussesJobs: boolean; summary?: string };

          this.memory.statuteResearch!.chunks.push({
            title,
            chunkIndex: i,
            text: chunkText,
            discussesJobs: !!analysis?.discussesJobs,
            summary: analysis?.summary || "",
          });
          await this.saveMemory();
        })
      );

      await Promise.all(tasks);
    }
  }

  private async extractJobTitleDegreeInformation(): Promise<void> {
    if (this.memory.extractedJobTitleDegreeInformation?.length) {
      return;
    }

    this.memory.extractedJobTitleDegreeInformation =
      this.memory.extractedJobTitleDegreeInformation || [];

    const existing = new Set(
      this.memory.extractedJobTitleDegreeInformation.map(
        (i) => `${i.title}-${i.chunkIndex}`
      )
    );

    const relevant = (this.memory.statuteResearch?.chunks || []).filter(
      (c: StatuteChunkAnalysis) =>
        c.discussesJobs && !existing.has(`${c.title}-${c.chunkIndex}`)
    );

    const limit = pLimit(MAX_PARALLEL_CHUNKS);
    const tasks = relevant.map((chunk: StatuteChunkAnalysis) =>
      limit(async () => {
        const res = (await this.callModel(
          PsAiModelType.Text,
          PsAiModelSize.Medium,
          [
            this.createSystemMessage(
              `Extract any text about degree requirements or preferences for a job title from the following statute text.
               Reply only with JSON { "degreeInformation": string[] }`
            ),
            this.createHumanMessage(
              `<statuteTextToLookForDegreeInformation>${chunk.text}</statuteTextToLookForDegreeInformation>`
            ),
          ]
        )) as { degreeInformation: string[] };

        if (res?.degreeInformation?.length) {
          this.memory.extractedJobTitleDegreeInformation!.push({
            title: chunk.title,
            chunkIndex: chunk.chunkIndex,
            extractedJobTitleDegreeInformation: res.degreeInformation,
          });
          await this.saveMemory();
        }
      })
    );

    await Promise.all(tasks);
  }

  async analyseJob(
    jobTitle: string
  ): Promise<{
    results: JobStatuteMatchResult[];
    educationRequirementResults: EducationRequirementResearchResult[];
  }> {
    await this.loadAndScanStatuesIfNeeded();

    this.memory.statuteResearch = (this.memory.statuteResearch || {
      chunks: [],
      jobMatches: {},
    }) as StatuteResearchMemory;

    this.memory.statuteResearch!.jobMatches = {};

    const analyzer = new EducationRequirementAnalyzerAgent(
      this.agent,
      this.memory,
      0,
      100
    );

    const results: JobStatuteMatchResult[] = [];
    const educationRequirementResults: EducationRequirementResearchResult[] =
      [];
    // Limit concurrent analysis to avoid overwhelming the model provider
    const limit = pLimit(MAX_PARALLEL_CHUNKS);

    const tasks = this.memory.extractedJobTitleDegreeInformation!.map((chunk: ExtractedJobTitleInformation) =>
      limit(async () => {
        console.log("chunk", chunk.extractedJobTitleDegreeInformation.join("\n"));
        const res = (await this.callModel(
          PsAiModelType.Text,
          PsAiModelSize.Medium,
          [
            this.createSystemMessage(
              `Does the <extractedJobTitleDegreeInformation> mention the job title \"${jobTitle}\" or requirements for it?\n
               Reply only with JSON {
                 mentionsJob: boolean
               }`
            ),
            this.createHumanMessage(
              `<extractedJobTitleDegreeInformation>${chunk.extractedJobTitleDegreeInformation.join("\n")}</extractedJobTitleDegreeInformation>
               <jobTitle>${jobTitle}</jobTitle>\n`
            ),
          ],
          {
            modelName: "gpt-4.1-nano",
            modelProvider: "openai",
          }
        )) as { mentionsJob: boolean };

        if (res?.mentionsJob) {
          const analysis = (await analyzer.analyze(
            chunk.extractedJobTitleDegreeInformation.join("\n"),
            jobTitle,
            ""
          )) as EducationRequirementResearchResult;
          if (analysis) {
            results.push({
              jobTitle,
              title: chunk.title,
              chunkIndex: chunk.chunkIndex,
              mentionsJob: !!res?.mentionsJob,
              reasoning: "",
            });
            educationRequirementResults.push(analysis);
            await this.saveMemory();
          }
        }
      })
    );

    await Promise.all(tasks);

    this.memory.statuteResearch!.jobMatches[jobTitle] = results;
    await this.saveMemory();
    return { results, educationRequirementResults };
  }

  private splitByTitle(text: string): { title: string; text: string }[] {
    const lines = text.split(/\r?\n/);
    const results: { title: string; text: string }[] = [];
    let currentTitle = "";
    let buffer: string[] = [];
    for (const line of lines) {
      const match = line.match(/^TITLE\s+\w+/);
      if (match) {
        if (currentTitle) {
          results.push({ title: currentTitle, text: buffer.join("\n") });
        }
        currentTitle = match[0];
        buffer = [];
      } else {
        buffer.push(line);
      }
    }
    if (currentTitle) {
      results.push({ title: currentTitle, text: buffer.join("\n") });
    }
    return results;
  }

  private splitIntoChunks(text: string, maxWords: number): string[] {
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    for (let i = 0; i < words.length; i += maxWords) {
      chunks.push(words.slice(i, i + maxWords).join(" "));
    }
    if (!chunks.length) chunks.push(text);
    return chunks;
  }
}
