import { PDFParse } from "pdf-parse";

export async function extractTextFromPdfBuffer(
  pdfBuffer: Buffer
): Promise<string> {
  const parser = new PDFParse({ data: pdfBuffer });

  try {
    const result = await parser.getText({ pageJoiner: "" });
    return result.text.replace(/(\r\n|\n|\r){3,}/gm, "\n\n").trim();
  } finally {
    await parser.destroy().catch(() => undefined);
  }
}
