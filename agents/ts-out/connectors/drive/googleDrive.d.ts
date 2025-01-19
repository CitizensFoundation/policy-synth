import { PsBaseDriveConnector } from "../base/baseDriveConnector.js";
import { drive_v3 } from "googleapis";
import { JWT } from "google-auth-library";
import { PsAgent } from "../../dbModels/agent.js";
export declare class PsGoogleDriveConnector extends PsBaseDriveConnector {
    static readonly GOOGLE_DRIVE_CONNECTOR_CLASS_BASE_ID = "50dfce2f-7dcf-4379-baa9-5ab460f17b86";
    static readonly GOOGLE_DRIVE_CONNECTOR_VERSION = 1;
    static getConnectorClass: PsAgentConnectorClassCreationAttributes;
    client: JWT;
    drive: drive_v3.Drive;
    constructor(connector: PsAgentConnectorAttributes, connectorClass: PsAgentConnectorClassAttributes, agent: PsAgent, memory?: PsAgentMemoryData | undefined, startProgress?: number, endProgress?: number);
    /**
     * Extra questions for configuration if needed
     * (similar to what the Docs connector does).
     */
    static getExtraConfigurationQuestions(): YpStructuredQuestionData[];
    /**
     * Lists files in Google Drive (example: retrieving the first 10).
     */
    list(): Promise<any[]>;
    /**
     * Gets a file's metadata (and possibly content) from Google Drive by fileId.
     * For actual file contents, you'd typically do a `drive.files.get({ alt: "media" })`
     * or `drive.files.export` for Google Docs. This just retrieves metadata for demonstration.
     * @param fileId - The ID of the file to retrieve.
     */
    get(fileId: string): Promise<any>;
    /**
     * Creates (uploads) a new file to Google Drive.
     * For simplicity, this example just creates an empty file with some name.
     *
     * @param data - object with { name, mimeType, etc. }
     */
    post(data: any): Promise<any>;
    /**
     * Updates an existing file on Google Drive.
     *
     * @param fileId - The ID of the file to update.
     * @param data - Data (metadata, content) to update in the file.
     */
    put(fileId: string, data: any): Promise<any>;
    /**
     * Deletes a file from Google Drive.
     *
     * @param fileId - The ID of the file to delete.
     */
    delete(fileId: string): Promise<void>;
}
//# sourceMappingURL=googleDrive.d.ts.map