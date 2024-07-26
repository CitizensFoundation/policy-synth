import fs from "fs/promises";
import path from "path";
import crypto, { createHash } from "crypto";
import fetch from "node-fetch";
import { HTTPResponse, Page, Browser } from "puppeteer";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

import { PolicySynthScAgentBase } from "@policysynth/agents/baseAgent.js";
import { PsConstants } from "@policysynth/agents/constants.js";
import { BaseIngestionAgent } from "./baseAgent.js";
import { EcasYayChunkAnalyserAgent } from "./chunkAnalyzer.js";

import XLSX from "xlsx";
import { PsEcasYeaRagChunkVectorStore } from "../vectorstore/ragChunk.js";

export class EcasYayIngestionAgentProcessor extends BaseIngestionAgent {
  chunkAnalysisAgent: EcasYayChunkAnalyserAgent;

  constructor() {
    super();

    this.chunkAnalysisAgent = new EcasYayChunkAnalyserAgent();
  }

  async getChunksFromXlsx(filePath: string) {
    // Convert filePath to absolute if not already
    const absoluteFilePath = path.resolve(filePath);

    // Read the Excel file
    const workbook = XLSX.readFile(absoluteFilePath);

    // Assuming the data is in the first sheet
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Convert sheet to JSON, explicitly stating the expected format
    // Since there's no header, every row is treated as data
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as [
      string,
      string
    ][];

    // Map rows to desired format without skipping any rows
    const chunks = rows
      .filter(([question, answer]) => question && answer) // Checks if both question and answer are not empty or undefined
      .map(([question, answer]) => ({ question, answer }));

    console.log(JSON.stringify(chunks, null, 2));
    return chunks;
  }

  async ingest(filePath = "src/ingestion/data/ecasYeaData.xlsx") {
    const chunks = await this.getChunksFromXlsx(filePath);

    for (const chunk of chunks) {
      const vectoreStore = new PsEcasYeaRagChunkVectorStore();
      await vectoreStore.postChunk(chunk);
    }
  }
}
