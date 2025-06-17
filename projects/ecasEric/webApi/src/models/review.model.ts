import { Sequelize, DataTypes, Model, Optional, BelongsToGetAssociationMixin, fn, col, Op } from 'sequelize';
import { sequelize } from './index.js';
import { QAPair } from './qaPair.model.js';
import { AdminUser } from './adminUser.model.js';
import { ChatSession } from './chatSession.model.js'; // Assuming ChatSession model exists

interface ReviewAttributes {
  id: number;
  qaPairId?: number; // FK to QAPair (if review is for a specific Q&A)
  chatSessionId?: number; // FK to ChatSession (if review is for a whole chat)
  answerHash?: string; // Hash of the AI answer text for standalone review
  rating: number; // e.g., 1-5
  notes?: string;
  reviewerId?: number; // FK to AdminUser (if logged in user reviews)
}

interface ReviewCreationAttributes extends Optional<ReviewAttributes, 'id' | 'qaPairId' | 'chatSessionId' | 'answerHash' | 'notes' | 'reviewerId'> {}

class Review extends Model<ReviewAttributes, ReviewCreationAttributes> implements ReviewAttributes {
  declare id: number;
  declare qaPairId?: number;
  declare chatSessionId?: number;
  declare answerHash?: string;
  declare rating: number;
  declare notes?: string;
  declare reviewerId?: number;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Association mixins
  declare getQAPair: BelongsToGetAssociationMixin<QAPair>;
  declare getChatSession: BelongsToGetAssociationMixin<ChatSession>;
  declare getReviewer: BelongsToGetAssociationMixin<AdminUser>;

  // Static method for aggregation
  static async aggregateForQaPair(qaPairId: number): Promise<{ avgRating: number | null; count: number }> {
    const result = await Review.findOne({
      attributes: [
        [fn('AVG', col('rating')), 'avgRating'],
        [fn('COUNT', col('id')), 'count']
      ],
      where: {
        qaPairId: qaPairId
      },
      raw: true // Get plain object
    });

    // Ensure avgRating is a number or null
    const avgRating = result && typeof (result as any).avgRating === 'string'
                        ? parseFloat((result as any).avgRating)
                        : result && (result as any).avgRating !== null
                        ? Number((result as any).avgRating)
                        : null;
    const count = result ? Number((result as any).count) : 0;

    return { avgRating, count };
  }
}

Review.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    qaPairId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: QAPair,
        key: 'id',
      },
    },
    chatSessionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: ChatSession,
        key: 'id',
      },
    },
    answerHash: {
      type: DataTypes.STRING, // Could be SHA-256 hash
      allowNull: true,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reviewerId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Allow anonymous reviews initially?
      references: {
        model: AdminUser,
        key: 'id',
      },
    },
  },
  {
    tableName: 'reviews',
    sequelize,
    indexes: [
        { fields: ['qaPairId'] },
        { fields: ['chatSessionId'] },
        { fields: ['reviewerId'] },
        { fields: ['answerHash'] },
        // Add composite unique index
        {
            name: 'unique_review_per_user_per_answer',
            unique: true,
            fields: ['answerHash', 'reviewerId'],
            where: {
                answerHash: { [Op.ne]: null }, // Use imported Op
                reviewerId: { [Op.ne]: null }  // Use imported Op
            }
        }
    ],
    validate: {
      // Ensure at least one context (qaPair, chatSession, or answerHash) is provided
      isContextProvided() {
        if (!this.qaPairId && !this.chatSessionId && !this.answerHash) {
          throw new Error('Review must be linked to a QAPair, ChatSession, or have an Answer Hash.');
        }
      }
    }
  }
);

// Associations
Review.belongsTo(QAPair, { foreignKey: 'qaPairId' });
QAPair.hasMany(Review, { foreignKey: 'qaPairId' });

Review.belongsTo(ChatSession, { foreignKey: 'chatSessionId' });
ChatSession.hasMany(Review, { foreignKey: 'chatSessionId' });

Review.belongsTo(AdminUser, { foreignKey: 'reviewerId', as: 'reviewer' });
AdminUser.hasMany(Review, { foreignKey: 'reviewerId' });

export { Review };