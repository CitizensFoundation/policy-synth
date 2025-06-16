/// <reference types="node" />
import { QAPair, QAPairQuestionType } from '../models/qaPair.model.js';
interface QACreateDTO {
    topicId: number;
    question: string;
    answer: string;
    questionType?: QAPairQuestionType;
    source?: string;
}
export declare class QaService {
    list(topicId?: number, page?: number, pageSize?: number): Promise<{
        rows: QAPair[];
        count: number;
    }>;
    findById(id: number): Promise<QAPair | null>;
    create(data: QACreateDTO): Promise<QAPair>;
    update(id: number, data: Partial<QACreateDTO>): Promise<[number]>;
    delete(id: number): Promise<number>;
    bulkImportFromXlsx(topicId: number, fileBuffer: Buffer): Promise<{
        successCount: number;
        errorCount: number;
        errors: string[];
    }>;
}
export {};
//# sourceMappingURL=qaService.d.ts.map