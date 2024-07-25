export declare class IngestionContentParser {
    parsePdf(pdfBuffer: Buffer): Promise<string>;
    parseHtml(htmlText: string): string;
    parseDocx(filePath: string): Promise<string>;
    parseXls(filePath: string): string;
    parseFile(filePath: string): Promise<string>;
}
//# sourceMappingURL=contentParser.d.ts.map