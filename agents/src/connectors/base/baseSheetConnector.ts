import { PsBaseConnector } from "./baseConnector.js";

export abstract class PsBaseSheetConnector extends PsBaseConnector {
  abstract getSheet(): Promise<string[][]>;
  abstract updateSheet(data: string[][]): Promise<void>;
  abstract getRange(range: string): Promise<string[][]>;
  abstract updateRange(range: string, data: string[][]): Promise<void>;
}