import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";

import axios from "axios";
import * as cheerio from "cheerio";
import * as pdf from "pdf-parse";
import * as xlsx from "xlsx";
import fs from "fs";

export class RequirementExtractorAgent extends PolicySynthAgent {
  declare memory: LicenseDegreeAnalysisMemoryData;

  constructor(agent: PsAgent, memory: LicenseDegreeAnalysisMemoryData, start: number, end: number) {
    super(agent, memory, start, end);
  }

  async extractRequirements(url: string): Promise<string> {
    await this.updateRangedProgress(0, `Fetching requirements from ${url}`);

    let text = "";

    try {
      const resp = await axios.get<ArrayBuffer>(url, { responseType: "arraybuffer", timeout: 15000 });
      const contentType = resp.headers["content-type"] || "";

      if (contentType.includes("pdf")) {
        const pdfText = await pdf.default(Buffer.from(resp.data));
        text = pdfText.text;
      } else {
        const html = resp.data.toString();
        const $ = cheerio.load(html);
        text = $("body").text();
      }
    } catch (err) {
      this.logger.error(`Failed to fetch or parse ${url}: ${err}`);
    }

    await this.updateRangedProgress(100, "Completed all job titles");
    return text;
  }
}