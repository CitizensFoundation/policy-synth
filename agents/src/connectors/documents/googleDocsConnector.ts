import { google, docs_v1 } from "googleapis";
import { JWT } from "google-auth-library";
import { PsAgentConnectorClass } from "../../dbModels/agentConnectorClass.js";
import { PsAgentConnector } from "../../dbModels/agentConnector.js";
import { PsAgent } from "../../dbModels/agent.js";
import { PsBaseDocumentConnector } from "../base/baseDocumentConnector.js";
import { PsConnectorClassTypes } from "../../connectorTypes.js";

function deepClone(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(deepClone);
  const cloned: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

function getFieldsFromAttributes(attributes: any, prefix = ''): string {
  const fields: string[] = [];
  for (const key in attributes) {
    const value = attributes[key];
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const subFields = getFieldsFromAttributes(value, path);
      fields.push(subFields);
    } else {
      fields.push(path);
    }
  }
  return fields.join(',');
}

export class PsGoogleDocsConnector extends PsBaseDocumentConnector {
  static readonly GOOGLE_DOCS_CONNECTOR_CLASS_BASE_ID =
    "3a7b2c1d-4e5f-6a7b-8c9d-0e1f2a3b4c5d";

  static readonly GOOGLE_DOCS_CONNECTOR_VERSION = 6;

  static getConnectorClass: PsAgentConnectorClassCreationAttributes = {
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
      imageUrl:
        "https://aoi-storage-production.citizens.is/dl/948e0e85b5a4036af23fa33aad2672cc--retina-1.png",
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

  client: JWT;
  docs: docs_v1.Docs;

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
      scopes: [
        "https://www.googleapis.com/auth/documents"
      ],
    });

    // Authorize and create a Google Docs API instance
    try {
      this.docs = google.docs({ version: "v1", auth: this.client });
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  async getDocument(): Promise<string> {
    const documentId: string = this.getConfig("googleDocsId", "");
    if (!documentId) {
      throw new Error("Google Docs ID is not set.");
    }

    try {
      const document: docs_v1.Schema$Document = await this.getData(documentId);
      return this.extractText(document.body?.content || []);
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  async updateDocument(doc: string): Promise<void> {
    const documentId: string = this.getConfig("googleDocsId", "");
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
    } catch (error: any) {
      console.error("Error updating document:", error);
      if (error.code === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      } else if (error.code >= 500 && error.code < 600) {
        throw new Error("Google Docs server error. Please try again later.");
      } else {
        throw error;
      }
    }
  }

  async getData(documentId: string): Promise<docs_v1.Schema$Document> {
    console.log("Getting data for document:", documentId);
    try {
      const response = await this.docs.documents.get({
        documentId,
      });
      return response.data;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  markdownToGoogleDocs(markdown: string): {
    requests: docs_v1.Schema$Request[];
  } {
    const requests: docs_v1.Schema$Request[] = [];
    let currentIndex = 1;

    // Base font for the document
    const baseAttributes: any = {
      weightedFontFamily: {
        fontFamily: "Poppins",
      },
      fontSize: { magnitude: 11, unit: "PT" },
    };

    // Split markdown into lines
    const lines = markdown.split("\n");
    let insideCodeBlock = false;

    for (let line of lines) {
      // Handle code blocks
      if (line.startsWith("```")) {
        insideCodeBlock = !insideCodeBlock;
        continue;
      }

      // Deep clone base attributes to prevent mutations
      let attributes = deepClone(baseAttributes);
      let text = line + "\n"; // Append newline character

      // Handle different Markdown elements
      if (insideCodeBlock) {
        Object.assign(attributes, deepClone({
          backgroundColor: {
            color: { rgbColor: { red: 0.95, green: 0.95, blue: 0.95 } },
          },
          weightedFontFamily: {
            fontFamily: "Courier New",
          },
        }));
      } else if (line.startsWith("# ")) {
        // H1
        text = line.substring(2) + "\n";
        Object.assign(attributes, deepClone({
          bold: true,
          fontSize: { magnitude: 22, unit: "PT" },
          weightedFontFamily: {
            fontFamily: "Prompt",
          },
        }));
      } else if (line.startsWith("## ")) {
        // H2
        text = line.substring(3) + "\n";
        Object.assign(attributes, deepClone({
          bold: true,
          fontSize: { magnitude: 18, unit: "PT" },
        }));
      } else if (line.startsWith("### ")) {
        // H3
        text = line.substring(4) + "\n";
        Object.assign(attributes, deepClone({
          bold: true,
          fontSize: { magnitude: 16, unit: "PT" },
        }));
      } else if (line.startsWith("#### ")) {
        // H4
        text = line.substring(5) + "\n";
        Object.assign(attributes, deepClone({
          bold: true,
          fontSize: { magnitude: 14, unit: "PT" },
        }));
      }

      // Initialize array to hold segments of text with styles
      let segments: { text: string; style: any }[] = [];

      // Process images
      const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
      let imageMatch;
      let remainingText = text;
      while ((imageMatch = imageRegex.exec(remainingText)) !== null) {
        const imageUrl = imageMatch[2];

        // Insert text before the image
        const indexBeforeImage = remainingText.indexOf(imageMatch[0]);
        if (indexBeforeImage > 0) {
          segments.push({
            text: remainingText.substring(0, indexBeforeImage),
            style: deepClone(attributes),
          });
        }

        // Insert image
        requests.push({
          insertInlineImage: {
            location: { index: currentIndex },
            uri: imageUrl,
          },
        });
        currentIndex += 1; // Images occupy one character position

        // Update remaining text
        remainingText = remainingText.substring(
          indexBeforeImage + imageMatch[0].length
        );
      }

      // Add any remaining text after last image
      if (remainingText) {
        segments.push({
          text: remainingText,
          style: deepClone(attributes),
        });
      }

      // Process each segment for inline styles
      for (let segment of segments) {
        let segmentText = segment.text;
        let segmentStyle = deepClone(segment.style);

        // Handle links
        const linkRegex = /\[(.*?)\]\((https?:\/\/[^\s)]+)\)/g;
        let linkMatch;
        let linkSegments: { text: string; style: any }[] = [];
        let lastIndex = 0;
        while ((linkMatch = linkRegex.exec(segmentText)) !== null) {
          // Text before the link
          if (linkMatch.index > lastIndex) {
            linkSegments.push({
              text: segmentText.substring(lastIndex, linkMatch.index),
              style: deepClone(segmentStyle),
            });
          }

          // Link text
          linkSegments.push({
            text: linkMatch[1],
            style: deepClone({
              ...segmentStyle,
              link: { url: linkMatch[2] },
              //underline: true,
              foregroundColor: {
               // color: { rgbColor: { red: 0.0, green: 0.0, blue: 1.0 } },
              },
            }),
          });

          lastIndex = linkMatch.index + linkMatch[0].length;
        }

        // Text after the last link
        if (lastIndex < segmentText.length) {
          linkSegments.push({
            text: segmentText.substring(lastIndex),
            style: deepClone(segmentStyle),
          });
        }

        // Process each link segment for bold and italic
        for (let linkSegment of linkSegments) {
          let linkSegmentText = linkSegment.text;
          let linkSegmentStyle = deepClone(linkSegment.style);

          // Handle bold and italic
          const styleRegex = /(\*\*|\*)(.*?)\1/g;
          let styleMatch;
          let styleSegments: { text: string; style: any }[] = [];
          let styleLastIndex = 0;
          while ((styleMatch = styleRegex.exec(linkSegmentText)) !== null) {
            // Text before the styled text
            if (styleMatch.index > styleLastIndex) {
              styleSegments.push({
                text: linkSegmentText.substring(
                  styleLastIndex,
                  styleMatch.index
                ),
                style: deepClone(linkSegmentStyle),
              });
            }

            // Styled text
            let styleAttributes = deepClone(linkSegmentStyle);
            if (styleMatch[1] === "**") {
              styleAttributes.bold = true;
            } else if (styleMatch[1] === "*") {
              styleAttributes.italic = true;
            }

            styleSegments.push({
              text: styleMatch[2],
              style: styleAttributes,
            });

            styleLastIndex = styleMatch.index + styleMatch[0].length;
          }

          // Text after the last styled text
          if (styleLastIndex < linkSegmentText.length) {
            styleSegments.push({
              text: linkSegmentText.substring(styleLastIndex),
              style: deepClone(linkSegmentStyle),
            });
          }

          // Insert each style segment
          for (let styleSegment of styleSegments) {
            if (styleSegment.text.length > 0) {
              // Insert the text
              requests.push({
                insertText: {
                  location: {
                    index: currentIndex,
                  },
                  text: styleSegment.text,
                },
              });

              // Update text style
              const fields = getFieldsFromAttributes(styleSegment.style);
              requests.push({
                updateTextStyle: {
                  range: {
                    startIndex: currentIndex,
                    endIndex: currentIndex + styleSegment.text.length,
                  },
                  textStyle: styleSegment.style,
                  fields: fields,
                },
              });

              currentIndex += styleSegment.text.length;
            }
          }
        }
      }
    }

    return { requests };
  }

  // Updated updateDocumentFromMarkdown method to handle images and links
  async updateDocumentFromMarkdown(markdown: string): Promise<void> {
    const documentId: string = this.getConfig("googleDocsId", "");
    if (!documentId) {
      throw new Error("Google Docs ID is not set.");
    }

    try {
      // Get the current document length
      const currentDoc = await this.docs.documents.get({ documentId });
      const endIndex =
        currentDoc.data.body?.content?.reduce((max, elem) => {
          return elem.endIndex ? Math.max(max, elem.endIndex) : max;
        }, 1) || 1;

      console.log(`Current document length: ${endIndex}`);

      let requests: docs_v1.Schema$Request[] = [];

      /* Delete existing content
      if (endIndex > 1) {
        requests.push({
          deleteContentRange: {
            range: {
              startIndex: 1,
              endIndex: endIndex - 1, // Adjusted to not delete the last newline character
            },
          },
        });
      }*/

      // Convert Markdown to Google Docs requests
      const { requests: markdownRequests } =
        this.markdownToGoogleDocs(markdown);

      // Combine delete request with markdown requests
      requests = requests.concat(markdownRequests);

      console.log(`Number of update requests: ${requests.length}`);
      console.log("Requests to be sent:", JSON.stringify(requests, null, 2));

      // Perform the batch update
      await this.docs.documents.batchUpdate({
        documentId,
        requestBody: {
          requests: requests,
        },
      });

      console.log("Document updated successfully");
    } catch (error: any) {
      console.error("Error updating document:", error);
      if (error.code === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      } else if (error.code >= 500 && error.code < 600) {
        throw new Error("Google Docs server error. Please try again later.");
      } else {
        throw error;
      }
    }
  }

  extractText(content: docs_v1.Schema$StructuralElement[]): string {
    let text: string = "";
    content.forEach((element: docs_v1.Schema$StructuralElement) => {
      if (element.paragraph) {
        element.paragraph.elements?.forEach((e) => {
          text += e.textRun?.content || "";
        });
      } else if (element.table) {
        element.table.tableRows?.forEach((row) => {
          row.tableCells?.forEach((cell) => {
            cell.content?.forEach((cellElement) => {
              text += this.extractText([cellElement]);
            });
          });
        });
      } else if (element.sectionBreak) {
        text += "\n";
      }
    });
    return text;
  }

  static getExtraConfigurationQuestions(): YpStructuredQuestionData[] {
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
