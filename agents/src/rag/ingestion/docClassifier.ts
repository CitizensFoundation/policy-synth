import { BaseIngestionAgent } from "./baseAgent.js";

export class DocumentClassifierAgent extends BaseIngestionAgent {
  systemMessage = (schema: string, about: string) =>
    this.createSystemMessage(`You are an expert classification agent that analyzes documents and classifies them.

Instructions:
- Use the available categories to classify the content the user will provide you with in the DOCUMENT_TO_CLASSIFY tag
- Output one primary category
- If there is one highly relevant secondaryCategory output it otherwise output "" in secondaryCategory
- Think step by step

Available categories:
${schema}

About this project:
${about}

JSON Output:
{
  primaryCategory: string;
  secondaryCategory: string
}
`);

  userMessage = (title: string, decription: string, url: string) =>
    this.createHumanMessage(`<DOCUMENT_TO_CLASSIFY>
Title: ${title}
Full description: ${decription}
</DOCUMENT_TO_CLASSIFY>

Document URL: ${url}

Your JSON classification:
`);

  async classify(
    metadata: PsRagDocumentSource,
    dataLayout: PsIngestionDataLayout
  ): Promise<void> {
    const documentClassification: PsRagDocumentClassificationResponse =
      await this.callLLM(
        "ingestion-agent",
        this.getFirstMessages(
          this.systemMessage(
            JSON.stringify(dataLayout.categories),
            dataLayout.aboutProject
          ),
          this.userMessage(
            metadata.title!,
            metadata.fullDescriptionOfAllContents!,
            metadata.url
          )
        )
      );
    metadata.primaryCategory = documentClassification.primaryCategory;
    metadata.secondaryCategory = documentClassification.secondaryCategory;
  }

  async classifyAllDocuments(
    documentSources: PsRagDocumentSource[],
    dataLayout: PsIngestionDataLayout
  ): Promise<void> {
    for (let s=0;s<documentSources.length;s++) {
      console.log(`Classifying ${s} of ${documentSources.length}`);
      const source = documentSources[s];
      await this.classify(source, dataLayout);
      console.log(
        `Classified ${source.title}: ${source.primaryCategory} ${source.secondaryCategory}`
      );
    }
  }
}
