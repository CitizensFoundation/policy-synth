import { DataTypes, Model } from 'sequelize';
import { sequelize } from './index.js';
class ChatSession extends Model {
    id;
    topicId;
    userId;
    chatLogJson;
    legacyMemoryId;
    createdAt;
    updatedAt;
}
ChatSession.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    topicId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        // If you create a Topic model and want a foreign key relationship:
        /*
        references: {
          model: 'topics', // or Topic model name
          key: 'id',
        },
        */
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    chatLogJson: {
        type: DataTypes.JSONB, // Use JSONB for PostgreSQL for better performance
        allowNull: true,
    },
    legacyMemoryId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
    },
}, {
    tableName: 'chat_sessions',
    sequelize,
    indexes: [
        { fields: ['topicId'] },
        { fields: ['userId'] },
        { fields: ['legacyMemoryId'] }
    ]
});
// Example: Define association if Topic model exists and is imported
// import { Topic } from './topic.model';
// ChatSession.belongsTo(Topic, { foreignKey: 'topicId' });
// Topic.hasMany(ChatSession, { foreignKey: 'topicId' });
export { ChatSession };
//# sourceMappingURL=chatSession.model.js.map