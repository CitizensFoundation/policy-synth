import { PsBaseConnector } from "./baseConnector.js";
/**
 * Abstract base connector for Drive-like services.
 * It defines the structure (list, get, post, put, delete) that all
 * drive connectors need to implement.
 */
export declare abstract class PsBaseDriveConnector extends PsBaseConnector {
    /**
     * Lists drive files or objects. Returns Promise of array or custom data structure.
     */
    abstract list(): Promise<any[]>;
    /**
     * Retrieves a drive file or object by its ID.
     * @param fileId - The ID of the file/object to retrieve.
     */
    abstract get(fileId: string): Promise<any>;
    /**
     * Creates (posts) a new file or object on the drive.
     * @param data - The data for the new file/object.
     */
    abstract post(data: any): Promise<any>;
    /**
     * Updates (puts) an existing file/object on the drive.
     * @param fileId - The ID of the file/object to update.
     * @param data - The updated content.
     */
    abstract put(fileId: string, data: any): Promise<any>;
    /**
     * Deletes a file/object from the drive.
     * @param fileId - The ID of the file/object to delete.
     */
    abstract delete(fileId: string): Promise<void>;
}
//# sourceMappingURL=baseDriveConnector.d.ts.map