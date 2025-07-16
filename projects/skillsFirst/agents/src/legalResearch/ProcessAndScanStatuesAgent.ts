import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";
import {
  PsAiModelSize,
  PsAiModelType,
} from "@policysynth/agents/aiModelTypes.js";
import type {
  JobStatuteMatchResult,
  StatuteChunkAnalysis,
  StatuteResearchMemory,
} from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class ProcessAndScanStatuesAgent extends PolicySynthAgent {
  declare memory: JobDescriptionMemoryData;

  constructor(agent: PsAgent, memory: JobDescriptionMemoryData) {
    super(agent, memory, 0, 100);
    this.memory = memory;
  }

  private get dataPath() {
    return join(__dirname, "data", "statues.txt");
  }

  async loadAndScanStatuesIfNeeded(): Promise<void> {
    this.memory.statuteResearch = (this.memory.statuteResearch || {
      chunks: [],
      jobMatches: {},
    }) as StatuteResearchMemory;

    if ((this.memory.statuteResearch.chunks || []).length) {
      return;
    }

    const raw = fs.readFileSync(this.dataPath, "utf8");
    const titles = this.splitByTitle(raw);

    for (const { title, text } of titles) {
      const chunks = this.splitIntoChunks(text, 700000);
      for (let i = 0; i < chunks.length; i++) {
        const chunkText = chunks[i];
        const analysis = (await this.callModel(
          PsAiModelType.Text,
          PsAiModelSize.Medium,
          [
            this.createSystemMessage(
              "Determine if the following legal text contains any discussion about jobs or job requirements. Reply only with JSON { \"discussesJobs\": boolean, \"summary\": string }"
            ),
            this.createHumanMessage(chunkText),
          ]
        )) as { discussesJobs: boolean; summary?: string };

        this.memory.statuteResearch.chunks.push({
          title,
          chunkIndex: i,
          text: chunkText,
          discussesJobs: !!analysis?.discussesJobs,
          summary: analysis?.summary || "",
        });
        await this.saveMemory();
      }
    }
  }

  async analyseJob(jobTitle: string): Promise<JobStatuteMatchResult[]> {
    await this.loadAndScanStatuesIfNeeded();

    this.memory.statuteResearch = (this.memory.statuteResearch || {
      chunks: [],
      jobMatches: {},
    }) as StatuteResearchMemory;

    if (this.memory.statuteResearch.jobMatches[jobTitle]) {
      return this.memory.statuteResearch.jobMatches[jobTitle];
    }

    const relevant = this.memory.statuteResearch.chunks.filter(
      (c: StatuteChunkAnalysis) => c.discussesJobs
    );
    const results: JobStatuteMatchResult[] = [];
    for (const chunk of relevant) {
      const res = (await this.callModel(
        PsAiModelType.TextReasoning,
        PsAiModelSize.Large,
        [
          this.createSystemMessage(
            `Does the following statute text mention the job title \"${jobTitle}\" or requirements for it? Reply only with JSON { \"mentionsJob\": boolean, \"reasoning\": string }`
          ),
          this.createHumanMessage(chunk.text),
        ]
      )) as { mentionsJob: boolean; reasoning: string };

      results.push({
        jobTitle,
        title: chunk.title,
        chunkIndex: chunk.chunkIndex,
        mentionsJob: !!res?.mentionsJob,
        reasoning: res?.reasoning || "",
      });
      await this.saveMemory();
    }

    this.memory.statuteResearch.jobMatches[jobTitle] = results;
    await this.saveMemory();
    return results;
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
