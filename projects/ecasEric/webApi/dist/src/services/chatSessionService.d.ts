import { ChatSession } from '../models/chatSession.model.js';
interface ListParams {
    page?: number;
    pageSize?: number;
    topicId?: number;
    minRating?: number;
}
export declare class ChatSessionService {
    list({ page, pageSize, topicId, minRating }: ListParams): Promise<{
        rows: ChatSession[];
        count: number;
    }>;
    findById(id: number): Promise<ChatSession | null>;
}
export {};
//# sourceMappingURL=chatSessionService.d.ts.map