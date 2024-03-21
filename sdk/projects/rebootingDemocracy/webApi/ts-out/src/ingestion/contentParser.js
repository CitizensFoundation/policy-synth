import { PdfReader } from "pdfreader";
import { htmlToText } from "html-to-text";
import mammoth from "mammoth";
import * as XLSX from "xlsx";
import fs from "fs/promises";
import path from "path";
export class IngestionContentParser {
    async parsePdf(pdfBuffer) {
        return new Promise((resolve, reject) => {
            let text = '';
            new PdfReader().parseBuffer(pdfBuffer, (err, item) => {
                if (err) {
                    reject(err);
                }
                else if (!item) {
                    resolve(text);
                }
                else if (item.text) {
                    text += item.text + ' ';
                }
            });
        });
    }
    parseHtml(htmlText) {
        return htmlToText(htmlText, {
            wordwrap: false,
            selectors: [
                { selector: "a", format: "skip" },
                { selector: "img", format: "skip" },
                { selector: "form", format: "skip" },
                { selector: "nav", format: "skip" },
            ],
        }).replace(/(\r\n|\n|\r){3,}/gm, "\n\n");
    }
    async parseDocx(filePath) {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
    }
    parseXls(filePath) {
        const workbook = XLSX.readFile(filePath);
        let text = '';
        workbook.SheetNames.forEach(sheetName => {
            const sheet = workbook.Sheets[sheetName];
            text += XLSX.utils.sheet_to_txt(sheet);
        });
        return text;
    }
    // Example method to determine file type and call appropriate parser
    async parseFile(filePath) {
        const fileType = path.extname(filePath).toLowerCase();
        switch (fileType) {
            case '.pdf':
                const pdfBuffer = await fs.readFile(filePath);
                return this.parsePdf(pdfBuffer);
            case '.html':
                const htmlText = await fs.readFile(filePath, 'utf-8');
                return this.parseHtml(htmlText);
            case '.docx':
                return this.parseDocx(filePath);
            case '.xls':
            case '.xlsx':
                return this.parseXls(filePath);
            case '.txt':
            case '.json':
            case '.md':
                return fs.readFile(filePath, 'utf-8');
            default:
                throw new Error(`Unsupported file type: ${fileType}`);
        }
    }
}
