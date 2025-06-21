// src/connectors/google/psGoogleDriveConnector.ts

import { PsBaseDriveConnector } from "../base/baseDriveConnector.js";
import { google, drive_v3 } from "googleapis";
import { JWT } from "google-auth-library";
import { PsAgentConnectorClass } from "../../dbModels/agentConnectorClass.js";
import { PsAgentConnector } from "../../dbModels/agentConnector.js";
import { PsAgent } from "../../dbModels/agent.js";
import { PsConnectorClassTypes } from "../../connectorTypes.js";

export class PsGoogleDriveConnector extends PsBaseDriveConnector {
  // Unique IDs and version, similar to the Docs connector
  static readonly GOOGLE_DRIVE_CONNECTOR_CLASS_BASE_ID =
    "50dfce2f-7dcf-4379-baa9-5ab460f17b86";
  static readonly GOOGLE_DRIVE_CONNECTOR_VERSION = 1;

  // Configuration for the "class" that can be stored in DB or used by your UI
  static getConnectorClass: PsAgentConnectorClassCreationAttributes = {
    class_base_id: PsGoogleDriveConnector.GOOGLE_DRIVE_CONNECTOR_CLASS_BASE_ID,
    name: "Google Drive",
    version: PsGoogleDriveConnector.GOOGLE_DRIVE_CONNECTOR_VERSION,
    user_id: 1,
    available: true,
    configuration: {
      name: "Google Drive",
      classType: PsConnectorClassTypes.Drive,
      description: "Connector for Google Drive",
      hasPublicAccess: true,
      imageUrl:
        "https://aoi-storage-production.citizens.is/dl/31f98f6ab00368d67b5bdee572d4b395--retina-1.png",
      iconName: "drive",
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
          uniqueId: "credentialsJson",
          text: "ServiceAccount JSON",
          type: "textArea",
          rows: 10,
          required: true,
        },
      ],
    },
  };

  client: JWT;
  drive: drive_v3.Drive;

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

    if (typeof credentialsConfig === "string") {
      try {
        credentials = JSON.parse(credentialsConfig);
      } catch (error) {
        throw new Error(
          "Invalid JSON string for Google Service Account credentials."
        );
      }
    } else if (typeof credentialsConfig === "object") {
      credentials = credentialsConfig;
    } else {
      throw new Error(
        "Invalid type for Google Service Account credentials. Expected string or object."
      );
    }

    if (!credentials.client_email || !credentials.private_key) {
      throw new Error(
        "Invalid Google Service Account credentials. Missing client_email or private_key."
      );
    }

    // Create a new JWT client using the credentials
    this.client = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    // Initialize the Drive API
    this.drive = google.drive({ version: "v3", auth: this.client });
  }

  /**
   * Extra questions for configuration if needed
   * (similar to what the Docs connector does).
   */
  static getExtraConfigurationQuestions(): YpStructuredQuestionData[] {
    return [
      {
        uniqueId: "credentialsJson",
        text: "ServiceAccount JSON",
        type: "textArea",
        rows: 10,
        required: true,
      },
    ];
  }

  /**
   * Lists files in Google Drive (example: retrieving the first 10).
   */
  async list(): Promise<any[]> {
    try {
      const res = await this.drive.files.list({
        pageSize: 10,
        fields: "files(id, name, mimeType)",
      });
      return res.data.files || [];
    } catch (error) {
      this.logger.error("Error listing Drive files:", error);
      throw error;
    }
  }

  /**
   * Gets a file's metadata (and possibly content) from Google Drive by fileId.
   * For actual file contents, you'd typically do a `drive.files.get({ alt: "media" })`
   * or `drive.files.export` for Google Docs. This just retrieves metadata for demonstration.
   * @param fileId - The ID of the file to retrieve.
   */
  async get(fileId: string): Promise<any> {
    if (!fileId) {
      throw new Error("File ID is not provided.");
    }
    try {
      const res = await this.drive.files.get({
        fileId,
        fields: "id, name, mimeType, size",
      });
      return res.data;
    } catch (error) {
      this.logger.error("Error getting file:", error);
      throw error;
    }
  }

  /**
   * Creates (uploads) a new file to Google Drive.
   * For simplicity, this example just creates an empty file with some name.
   *
   * @param data - object with { name, mimeType, etc. }
   */
  async post(data: any): Promise<any> {
    try {
      const fileMetadata = {
        name: data.name || "UntitledFile",
      };
      // For an actual upload, you'd include media/body with the file content.
      const res = await this.drive.files.create({
        requestBody: fileMetadata,
      });
      return res.data;
    } catch (error) {
      this.logger.error("Error creating file:", error);
      throw error;
    }
  }

  /**
   * Updates an existing file on Google Drive.
   *
   * @param fileId - The ID of the file to update.
   * @param data - Data (metadata, content) to update in the file.
   */
  async put(fileId: string, data: any): Promise<any> {
    if (!fileId) {
      throw new Error("File ID is not provided for update.");
    }
    try {
      const fileMetadata = {
        name: data.name || "UpdatedFile",
        // ... other metadata fields you want to update
      };
      // For updating file content:
      //  - Use media with { mimeType: "...", body: ... } if needed
      const res = await this.drive.files.update({
        fileId,
        requestBody: fileMetadata,
      });
      return res.data;
    } catch (error) {
      this.logger.error("Error updating file:", error);
      throw error;
    }
  }

  /**
   * Deletes a file from Google Drive.
   *
   * @param fileId - The ID of the file to delete.
   */
  async delete(fileId: string): Promise<void> {
    if (!fileId) {
      throw new Error("File ID is not provided for deletion.");
    }
    try {
      await this.drive.files.delete({ fileId });
    } catch (error) {
      this.logger.error("Error deleting file:", error);
      throw error;
    }
  }
}
