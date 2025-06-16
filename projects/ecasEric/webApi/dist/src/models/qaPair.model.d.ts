import { Model, Optional, BelongsToGetAssociationMixin } from 'sequelize';
import { Topic } from './topic.model.js';
export declare enum QAPairQuestionType {
    LEGAL_INFORMATION = "legal_information",
    LEGAL_ADVICE = "legal_advice",
    LEGAL_ASSISTANCE = "legal_assistance"
}
interface QAPairAttributes {
    id: number;
    topicId: number;
    question: string;
    answer: string;
    embeddingUuid?: string;
    questionType?: QAPairQuestionType;
    source?: string;
}
interface QAPairCreationAttributes extends Optional<QAPairAttributes, 'id' | 'embeddingUuid' | 'questionType' | 'source'> {
}
declare class QAPair extends Model<QAPairAttributes, QAPairCreationAttributes> implements QAPairAttributes {
    id: number;
    topicId: number;
    question: string;
    answer: string;
    embeddingUuid?: string;
    questionType?: QAPairQuestionType;
    source?: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    getTopic: BelongsToGetAssociationMixin<Topic>;
    static addHookForVectorSync(): void;
}
export { QAPair };
//# sourceMappingURL=qaPair.model.d.ts.map