/**
 * subAgents/sheetsExportParticipationDataAgent.ts
 *
 * Sub-agent #3: Exports the final data (including analysis) to Google Sheets.
 */
import { PolicySynthAgent } from "@policysynth/agents/base/agent.js";
import { PsConnectorFactory } from "@policysynth/agents/connectors/base/connectorFactory.js";
import { PsConnectorClassTypes } from "@policysynth/agents/connectorTypes.js";
export class SheetsExportParticipationDataAgent extends PolicySynthAgent {
    sheetsConnector;
    sheetName;
    chunkSize = 100; // how many rows to update in a single chunk
    constructor(agent, memory, startProgress, endProgress, sheetName) {
        super(agent, memory, startProgress, endProgress);
        this.memory = memory;
        this.sheetName = sheetName;
        this.sheetsConnector = PsConnectorFactory.getConnector(this.agent, this.memory, PsConnectorClassTypes.Spreadsheet, false);
        if (!this.sheetsConnector) {
            throw new Error("Google Sheets connector not found");
        }
    }
    /**
     * Main method to export data to Google Sheets.
     */
    async process() {
        await this.updateRangedProgress(0, "Starting export to Google Sheets");
        // Build the headers (two rows, e.g. full path / short)
        const headers = [
            "Title",
            "Statement",
            "Region",
            "Profession",
            "Theme",
            "Sentiment",
        ];
        const shortHeaders = headers.map((h) => {
            const idx = h.lastIndexOf(".");
            return idx === -1 ? h : h.substring(idx + 1);
        });
        const sheetData = [headers, shortHeaders];
        // Fill in data
        const items = this.memory.participationDataItems || [];
        items.forEach((item) => {
            sheetData.push([
                item.title || "",
                item.statement || "",
                item.region || "",
                item.profession || "",
                item.analysis?.theme || "",
                item.analysis?.sentimentAnalysis || "",
            ]);
        });
        // Now push it to the sheet
        // Example of updating from A1 through last needed row & column
        // We'll do it in a single chunk for simplicity:
        const endColLetter = this.columnIndexToLetter(headers.length - 1);
        const range = `${this.sheetName}!A1:${endColLetter}${sheetData.length}`;
        await this.sheetsConnector.updateRange(range, sheetData);
        await this.updateRangedProgress(100, "Exported data to Google Sheets");
        await this.setCompleted("Sheets export completed");
    }
    columnIndexToLetter(index) {
        let temp = index;
        let letter = "";
        while (temp >= 0) {
            letter = String.fromCharCode((temp % 26) + 65) + letter;
            temp = Math.floor(temp / 26) - 1;
        }
        return letter;
    }
}
//# sourceMappingURL=sheetsExportParticipationDataAgent.js.map