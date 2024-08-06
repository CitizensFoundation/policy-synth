import { google } from "googleapis";
import { JWT } from "google-auth-library";
import { PsBaseDocumentConnector } from "../base/baseDocumentConnector.js";
import { PsConnectorClassTypes } from "../../connectorTypes.js";
export class PsGoogleDocsConnector extends PsBaseDocumentConnector {
    static GOOGLE_DOCS_CONNECTOR_CLASS_BASE_ID = "3a7b2c1d-4e5f-6a7b-8c9d-0e1f2a3b4c5d";
    static GOOGLE_DOCS_CONNECTOR_VERSION = 2;
    static getConnectorClass = {
        class_base_id: this.GOOGLE_DOCS_CONNECTOR_CLASS_BASE_ID,
        name: "Google Docs",
        version: this.GOOGLE_DOCS_CONNECTOR_VERSION,
        user_id: 1,
        available: true,
        configuration: {
            name: "Google Docs",
            classType: PsConnectorClassTypes.Document,
            description: "Connector for Google Docs",
            hasPublicAccess: true,
            imageUrl: "https://aoi-storage-production.citizens.is/ypGenAi/community/1/339c8468-eb12-4167-a719-606bde321dc2.png",
            iconName: "docs",
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
                    uniqueId: "googleDocsId",
                    text: "Document ID",
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
        },
    };
    client;
    docs;
    constructor(connector, connectorClass, agent, memory = undefined, startProgress = 0, endProgress = 100) {
        super(connector, connectorClass, agent, memory, startProgress, endProgress);
        const credentialsConfig = this.getConfig("credentialsJson", "");
        if (!credentialsConfig) {
            throw new Error("Google Service Account credentials are not set.");
        }
        let credentials;
        if (typeof credentialsConfig === 'string') {
            try {
                credentials = JSON.parse(credentialsConfig);
            }
            catch (error) {
                throw new Error("Invalid JSON string for Google Service Account credentials.");
            }
        }
        else if (typeof credentialsConfig === 'object') {
            credentials = credentialsConfig;
        }
        else {
            throw new Error("Invalid type for Google Service Account credentials. Expected string or object.");
        }
        if (!credentials.client_email || !credentials.private_key) {
            throw new Error("Invalid Google Service Account credentials. Missing client_email or private_key.");
        }
        // Create a new JWT client using the credentials
        this.client = new JWT({
            email: credentials.client_email,
            key: credentials.private_key,
            scopes: ["https://www.googleapis.com/auth/documents"],
        });
        // Create a new JWT client using the credentials
        this.client = new JWT({
            email: credentials.client_email,
            key: credentials.private_key,
            scopes: ["https://www.googleapis.com/auth/documents"],
        });
        // Authorize and create a Google Docs API instance
        try {
            this.docs = google.docs({ version: "v1", auth: this.client });
        }
        catch (error) {
            console.error("Error:", error);
            throw error;
        }
    }
    async getDocument() {
        const documentId = this.getConfig("googleDocsId", "");
        if (!documentId) {
            throw new Error("Google Docs ID is not set.");
        }
        try {
            const document = await this.getData(documentId);
            return this.extractText(document.body?.content || []);
        }
        catch (error) {
            console.error("Error:", error);
            throw error;
        }
    }
    async updateDocument(doc) {
        const documentId = this.getConfig("googleDocsId", "");
        if (!documentId) {
            throw new Error("Google Docs ID is not set.");
        }
        try {
            // First, get the current document to find its length
            const currentDoc = await this.docs.documents.get({ documentId });
            const endIndex = currentDoc.data.body?.content?.length || 1;
            console.log(`Current document length: ${endIndex}`);
            let requests = [];
            // Only include the deleteContentRange request if there's actual content to delete
            if (false && endIndex > 1) {
                requests.push({
                    deleteContentRange: {
                        range: {
                            startIndex: 1,
                            endIndex: endIndex, // Include the entire content
                        },
                    },
                });
            }
            // Add the insertText request
            requests.push({
                insertText: {
                    location: {
                        index: 1,
                    },
                    text: doc,
                },
            });
            console.log(`Number of update requests: ${requests.length}`);
            console.log("Requests to be sent:", JSON.stringify(requests, null, 2));
            // Perform the update
            await this.docs.documents.batchUpdate({
                documentId,
                requestBody: {
                    requests: requests,
                },
            });
            console.log("Document updated successfully");
        }
        catch (error) {
            console.error("Error updating document:", error);
            if (error.code === 429) {
                throw new Error("Rate limit exceeded. Please try again later.");
            }
            else if (error.code >= 500 && error.code < 600) {
                throw new Error("Google Docs server error. Please try again later.");
            }
            else {
                throw error;
            }
        }
    }
    async getData(documentId) {
        console.log("Getting data for document:", documentId);
        try {
            const response = await this.docs.documents.get({
                documentId,
            });
            return response.data;
        }
        catch (error) {
            console.error("Error:", error);
            throw error;
        }
    }
    extractText(content) {
        let text = "";
        content.forEach((element) => {
            if (element.paragraph) {
                element.paragraph.elements?.forEach((e) => {
                    text += e.textRun?.content || "";
                });
            }
            else if (element.table) {
                element.table.tableRows?.forEach((row) => {
                    row.tableCells?.forEach((cell) => {
                        cell.content?.forEach((cellElement) => {
                            text += this.extractText([cellElement]);
                        });
                    });
                });
            }
            else if (element.sectionBreak) {
                text += "\n";
            }
        });
        return text;
    }
    static getExtraConfigurationQuestions() {
        return [
            {
                uniqueId: "googleDocsId",
                text: "Document ID",
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
//# sourceMappingURL=googleDocsConnector.js.map