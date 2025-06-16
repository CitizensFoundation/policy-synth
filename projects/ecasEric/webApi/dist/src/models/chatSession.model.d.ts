import { Model, Optional } from 'sequelize';
interface ChatSessionAttributes {
    id: number;
    topicId?: number;
    userId?: string;
    chatLogJson?: object;
    legacyMemoryId?: string;
}
interface ChatSessionCreationAttributes extends Optional<ChatSessionAttributes, 'id' | 'topicId' | 'userId' | 'chatLogJson' | 'legacyMemoryId'> {
}
declare class ChatSession extends Model<ChatSessionAttributes, ChatSessionCreationAttributes> implements ChatSessionAttributes {
    id: number;
    topicId?: number;
    userId?: string;
    chatLogJson?: object;
    legacyMemoryId?: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export { ChatSession };
//# sourceMappingURL=chatSession.model.d.ts.map