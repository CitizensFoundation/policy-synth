import { google, sheets_v4 } from "googleapis";
import { JWT } from "google-auth-library";
import { PsAgentConnectorClass } from "../../dbModels/agentConnectorClass.js";
import { PsAgentConnector } from "../../dbModels/agentConnector.js";
import { PsAgent } from "../../dbModels/agent.js";
import { PsConnectorClassTypes } from "../../connectorTypes.js";
import { PsBaseSheetConnector } from "../base/baseSheetConnector.js";

export class PsGoogleSheetsConnector extends PsBaseSheetConnector {
  static readonly GOOGLE_SHEETS_CONNECTOR_CLASS_BASE_ID =
    "4b8c3d2e-5f6a-1a8b-9c0d-1ecf3afb536d";

  static readonly GOOGLE_SHEETS_CONNECTOR_VERSION = 6;

  static getConnectorClass: PsAgentConnectorClassCreationAttributes = {
    class_base_id: this.GOOGLE_SHEETS_CONNECTOR_CLASS_BASE_ID,
    name: "Google Sheets",
    version: this.GOOGLE_SHEETS_CONNECTOR_VERSION,
    user_id: 1,
    available: true,
    configuration: {
      name: "Google Sheets",
      classType: PsConnectorClassTypes.Spreadsheet as string,
      description: "Connector for Google Sheets",
      hasPublicAccess: true,
      imageUrl:
        "https://aoi-storage-production.citizens.is/dl/b4169a97d688a3cfc763c453742fe77c--retina-1.png",
      iconName: "sheets",
      questions: [
        {
          uniqueId: "name",
          text: "Name",
          type: "textField",
          maxLength: 200,
          required: true,
        },
        {
          uniqueId: "description",
          text: "Description",
          type: "textArea",
          maxLength: 500,
          required: false,
        },
        {
          uniqueId: "googleSheetsId",
          text: "Spreadsheet ID",
          type: "textField",
          maxLength: 200,
          required: true,
        },
        {
          uniqueId: "credentialsJson",
          text: "ServiceAccount JSON",
          type: "textArea",
          rows: 10,
          required: true,
        },
      ],
    } as PsAgentConnectorConfiguration,
  };

  client: JWT;
  sheets: sheets_v4.Sheets;

  constructor(
    connector: PsAgentConnectorAttributes,
    connectorClass: PsAgentConnectorClassAttributes,
    agent: PsAgent,
    memory: PsAgentMemoryData | undefined = undefined,
    startProgress: number = 0,
    endProgress: number = 100
  ) {
    super(connector, connectorClass, agent, memory, startProgress, endProgress);

    const credentialsConfig = this.getConfig("credentialsJson", "");

    if (!credentialsConfig) {
      throw new Error("Google Service Account credentials are not set.");
    }

    let credentials: { client_email: string; private_key: string };

    if (typeof credentialsConfig === 'string') {
      try {
        credentials = JSON.parse(credentialsConfig);
      } catch (error) {
        throw new Error("Invalid JSON string for Google Service Account credentials.");
      }
    } else if (typeof credentialsConfig === 'object') {
      credentials = credentialsConfig;
    } else {
      throw new Error("Invalid type for Google Service Account credentials. Expected string or object.");
    }

    if (!credentials.client_email || !credentials.private_key) {
      throw new Error("Invalid Google Service Account credentials. Missing client_email or private_key.");
    }

    // Create a new JWT client using the credentials
    this.client = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    // Authorize and create a Google Sheets API instance
    try {
      this.sheets = google.sheets({ version: "v4", auth: this.client });
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  async getSheet(): Promise<string[][]> {
    const spreadsheetId: string = this.getConfig("googleSheetsId", "");
    if (!spreadsheetId) {
      throw new Error("Google Sheets ID is not set.");
    }

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'A1:ZZ',  // This will get all cells in the first sheet
      });
      return response.data.values || [];
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  async addSheetIfNotExists(sheetName: string): Promise<void> {
    const spreadsheetId: string = this.getConfig("googleSheetsId", "");
    if (!spreadsheetId) {
      throw new Error("Google Sheets ID is not set.");
    }

    try {
      // Get the spreadsheet metadata to check existing sheets
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId,
        includeGridData: false,
      });

      const sheets = response.data.sheets || [];
      const sheetExists = sheets.some(
        (sheet) => sheet.properties?.title === sheetName
      );

      if (!sheetExists) {
        // Sheet does not exist; add it
        await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [
              {
                addSheet: {
                  properties: {
                    title: sheetName,
                  },
                },
              },
            ],
          },
        });
        console.log(`Sheet '${sheetName}' added.`);
      } else {
        console.log(`Sheet '${sheetName}' already exists.`);
      }
    } catch (error) {
      console.error("Error in addSheetIfNotExists:", error);
      throw error;
    }
  }

  async createNewSheet(sheetName: string): Promise<void> {
    const spreadsheetId: string = this.getConfig("googleSheetsId", "");
    if (!spreadsheetId) {
      throw new Error("Google Sheets ID is not set.");
    }

    try {
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetName,
                },
              },
            },
          ],
        },
      });
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  async formatCells(range: string, format: sheets_v4.Schema$CellFormat): Promise<void> {
    const spreadsheetId: string = this.getConfig("googleSheetsId", "");
    if (!spreadsheetId) {
      throw new Error("Google Sheets ID is not set.");
    }

    try {
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId: 0,  // Assumes first sheet, adjust if needed
                  startRowIndex: 0,
                  endRowIndex: 1,
                  startColumnIndex: 0,
                  endColumnIndex: 5,
                },
                cell: {
                  userEnteredFormat: format,
                },
                fields: "userEnteredFormat",
              },
            },
          ],
        },
      });
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  async updateSheet(data: string[][]): Promise<void> {
    const spreadsheetId: string = this.getConfig("googleSheetsId", "");
    if (!spreadsheetId) {
      throw new Error("Google Sheets ID is not set.");
    }

    try {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'A1',  // Start from A1
        valueInputOption: 'RAW',
        requestBody: {
          values: data,
        },
      });
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  async getRange(range: string): Promise<string[][]> {
    const spreadsheetId: string = this.getConfig("googleSheetsId", "");
    if (!spreadsheetId) {
      throw new Error("Google Sheets ID is not set.");
    }

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });
      return response.data.values || [];
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  async updateRange(range: string, data: string[][]): Promise<void> {
    const spreadsheetId: string = this.getConfig("googleSheetsId", "");
    if (!spreadsheetId) {
      throw new Error("Google Sheets ID is not set.");
    }

    try {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        requestBody: {
          values: data,
        },
      });
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  async clearRange(range: string): Promise<void> {
    const spreadsheetId: string = this.getConfig("googleSheetsId", "");
    if (!spreadsheetId) {
      throw new Error("Google Sheets ID is not set.");
    }

    try {
      await this.sheets.spreadsheets.values.clear({
        spreadsheetId,
        range,
      });
      console.log(`Range '${range}' cleared successfully.`);
    } catch (error) {
      console.error(`Error clearing range '${range}':`, error);
      throw error;
    }
  }

  static getExtraConfigurationQuestions(): YpStructuredQuestionData[] {
    return [
      {
        uniqueId: "googleSheetsId",
        text: "Spreadsheet ID",
        type: "textField",
        maxLength: 200,
        required: true,
      },
      {
        uniqueId: "credentialsJson",
        text: "ServiceAccount JSON",
        type: "textArea",
        rows: 10,
        required: true,
      },
    ];
  }
}