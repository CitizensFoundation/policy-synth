import { Model, Optional, BelongsToGetAssociationMixin } from 'sequelize';
import { QAPair } from './qaPair.model';
import { AdminUser } from './adminUser.model';
import { ChatSession } from './chatSession.model';
interface ReviewAttributes {
    id: number;
    qaPairId?: number;
    chatSessionId?: number;
    answerHash?: string;
    rating: number;
    notes?: string;
    reviewerId?: number;
}
interface ReviewCreationAttributes extends Optional<ReviewAttributes, 'id' | 'qaPairId' | 'chatSessionId' | 'answerHash' | 'notes' | 'reviewerId'> {
}
declare class Review extends Model<ReviewAttributes, ReviewCreationAttributes> implements ReviewAttributes {
    id: number;
    qaPairId?: number;
    chatSessionId?: number;
    answerHash?: string;
    rating: number;
    notes?: string;
    reviewerId?: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    getQAPair: BelongsToGetAssociationMixin<QAPair>;
    getChatSession: BelongsToGetAssociationMixin<ChatSession>;
    getReviewer: BelongsToGetAssociationMixin<AdminUser>;
    static aggregateForQaPair(qaPairId: number): Promise<{
        avgRating: number | null;
        count: number;
    }>;
}
export { Review };
//# sourceMappingURL=review.model.d.ts.map