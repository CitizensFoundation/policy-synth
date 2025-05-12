import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './index';

interface ChatSessionAttributes {
  id: number;
  topicId?: number; // Optional: if chat is related to a specific topic
  userId?: string; // Could be an admin user ID or an anonymous session ID from Redis
  // Add other relevant fields: e.g., startedAt, endedAt, metadata, full chat log (JSONB)
  chatLogJson?: object; // Storing the full chat log as JSON
  legacyMemoryId?: string; // To link with existing Redis-based memoryId
}

interface ChatSessionCreationAttributes extends Optional<ChatSessionAttributes, 'id' | 'topicId' | 'userId' | 'chatLogJson' | 'legacyMemoryId'> {}

class ChatSession extends Model<ChatSessionAttributes, ChatSessionCreationAttributes> implements ChatSessionAttributes {
  public id!: number;
  public topicId?: number;
  public userId?: string;
  public chatLogJson?: object;
  public legacyMemoryId?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Possible associations to Topic and AdminUser (if userId maps to AdminUser.id)
}

ChatSession.init(
  {
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
  },
  {
    tableName: 'chat_sessions',
    sequelize,
    indexes: [
        { fields: ['topicId'] },
        { fields: ['userId'] },
        { fields: ['legacyMemoryId'] }
    ]
  }
);

// Example: Define association if Topic model exists and is imported
// import { Topic } from './topic.model';
// ChatSession.belongsTo(Topic, { foreignKey: 'topicId' });
// Topic.hasMany(ChatSession, { foreignKey: 'topicId' });

export { ChatSession };