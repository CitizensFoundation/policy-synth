import { PsAgent } from "../../dbModels/agent.js";
import { PsBaseSheetConnector } from "../base/baseSheetConnector.js";
export declare class PsGoogleSheetsConnector extends PsBaseSheetConnector {
    private static readonly GOOGLE_SHEETS_CONNECTOR_CLASS_BASE_ID;
    private static readonly GOOGLE_SHEETS_CONNECTOR_VERSION;
    static getConnectorClass: PsConnectorClassCreationAttributes;
    private client;
    private sheets;
    constructor(connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory?: PsAgentMemoryData | undefined, startProgress?: number, endProgress?: number);
    getSheet(): Promise<string[][]>;
    updateSheet(data: string[][]): Promise<void>;
    getRange(range: string): Promise<string[][]>;
    updateRange(range: string, data: string[][]): Promise<void>;
    static getExtraConfigurationQuestions(): YpStructuredQuestionData[];
}
//# sourceMappingURL=googleSheetsConnector.d.ts.map