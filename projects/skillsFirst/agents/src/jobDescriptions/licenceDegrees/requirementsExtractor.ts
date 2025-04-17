import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsAgent } from "@policysynth/agents/dbModels/agent.js";

import axios from "axios";
import * as cheerio from "cheerio";
import { PdfReader } from "pdfreader";
import * as xlsx from "xlsx";

export class RequirementExtractorAgent extends PolicySynthAgent {
  declare memory: LicenseDegreeAnalysisMemoryData;

  constructor(
    agent: PsAgent,
    memory: LicenseDegreeAnalysisMemoryData,
    start: number,
    end: number
  ) {
    super(agent, memory, start, end);
  }

  /**
   * Fetch a remote document (HTML, PDF, XLS/XLSX, plain text) and return its
   * textual contents suitable for downstream LLM analysis.
   */
  async extractRequirements(url: string): Promise<string> {
    await this.updateRangedProgress(0, `Fetching requirements from ${url}`);

    let text = "";

    try {
      const resp = await axios.get<ArrayBuffer>(url, {
        responseType: "arraybuffer",
        timeout: 15_000,
        headers: { "User-Agent": "PolicySynth-Agent/1.0 (+https://citizens.is)" },
      });

      const contentType = resp.headers["content-type"]?.toLowerCase() ?? "";

      if (contentType.includes("pdf") || url.endsWith(".pdf")) {
        text = await this.pdfToText(Buffer.from(resp.data));
      } else if (contentType.includes("sheet") || url.match(/\.(xlsx?|xlsm)$/i)) {
        text = this.xlsxToText(Buffer.from(resp.data));
      } else {
        const html = Buffer.from(resp.data).toString("utf8");
        const $ = cheerio.load(html);
        text = $("body").text();
      }
    } catch (err) {
      this.logger.error(`Failed to fetch or parse ${url}: ${err}`);
    }

    await this.updateRangedProgress(100, "Finished extracting requirements");
    return text.replace(/\s+/g, " ").trim();
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // INTERNAL HELPERS
  // ──────────────────────────────────────────────────────────────────────────────

  private pdfToText(data: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new PdfReader();
      let txt = "";

      reader.parseBuffer(data, (err, item) => {
        if (err) return reject(err);
        if (!item) return resolve(txt); // end of document
        if ((item as any).text) txt += (item as any).text + " ";
      });
    });
  }

  private xlsxToText(data: Buffer): string {
    const wb = xlsx.read(data, { type: "buffer" });
    const all: string[] = [];

    wb.SheetNames.forEach((n) => {
      const ws = wb.Sheets[n];
      const json = xlsx.utils.sheet_to_json(ws, { header: 1, raw: false });
      all.push(
        (json as unknown[]).map((row) => (Array.isArray(row) ? row.join(" \t ") : String(row))).join("\n")
      );
    });

    return all.join("\n");
  }
}
