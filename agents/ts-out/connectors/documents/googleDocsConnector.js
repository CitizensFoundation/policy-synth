import { google } from "googleapis";
import { JWT } from "google-auth-library";
import { PsBaseDocumentConnector } from "../base/baseDocumentConnector.js";
export class PsGoogleDocsConnector extends PsBaseDocumentConnector {
    static GOOGLE_DOCS_CONNECTOR_CLASS_BASE_ID = "3a7b2c1d-4e5f-6a7b-8c9d-0e1f2a3b4c5d";
    static GOOGLE_DOCS_CONNECTOR_VERSION = 1;
    static getConnectorClass = {
        class_base_id: this.GOOGLE_DOCS_CONNECTOR_CLASS_BASE_ID,
        name: "Google Docs",
        version: this.GOOGLE_DOCS_CONNECTOR_VERSION,
        user_id: 1,
        available: true,
        configuration: {
            name: "Google Docs",
            description: "Connector for Google Docs",
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
        const credentialsJson = this.getConfig("credentialsJson", "");
        if (!credentialsJson) {
            throw new Error("Google Service Account credentials are not set.");
        }
        const credentials = JSON.parse(credentialsJson);
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
            await this.docs.documents.batchUpdate({
                documentId,
                requestBody: {
                    requests: [
                        {
                            deleteContentRange: {
                                range: {
                                    startIndex: 1,
                                    endIndex: -1,
                                },
                            },
                        },
                        {
                            insertText: {
                                location: {
                                    index: 1,
                                },
                                text: doc,
                            },
                        },
                    ],
                },
            });
        }
        catch (error) {
            console.error("Error:", error);
            throw error;
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