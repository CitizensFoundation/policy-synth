import { sheets_v4 } from "googleapis";
import { JWT } from "google-auth-library";
import { PsAgent } from "../../dbModels/agent.js";
import { PsBaseSheetConnector } from "../base/baseSheetConnector.js";
export declare class PsGoogleSheetsConnector extends PsBaseSheetConnector {
    static readonly GOOGLE_SHEETS_CONNECTOR_CLASS_BASE_ID = "4b8c3d2e-5f6a-1a8b-9c0d-1ecf3afb536d";
    static readonly GOOGLE_SHEETS_CONNECTOR_VERSION = 6;
    static getConnectorClass: PsAgentConnectorClassCreationAttributes;
    client: JWT;
    sheets: sheets_v4.Sheets;
    constructor(connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory?: PsAgentMemoryData | undefined, startProgress?: number, endProgress?: number);
    getSheet(): Promise<string[][]>;
    addSheetIfNotExists(sheetName: string): Promise<void>;
    createNewSheet(sheetName: string): Promise<void>;
    formatCells(range: string, format: sheets_v4.Schema$CellFormat): Promise<void>;
    updateSheet(data: string[][]): Promise<void>;
    getRange(range: string): Promise<string[][]>;
    updateRange(range: string, data: string[][]): Promise<void>;
    static getExtraConfigurationQuestions(): YpStructuredQuestionData[];
}
//# sourceMappingURL=googleSheetsConnector.d.ts.map