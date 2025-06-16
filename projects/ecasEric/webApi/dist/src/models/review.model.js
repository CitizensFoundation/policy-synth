import { DataTypes, Model, fn, col, Op } from 'sequelize';
import { sequelize } from './index.js';
import { QAPair } from './qaPair.model.js';
import { AdminUser } from './adminUser.model.js';
import { ChatSession } from './chatSession.model.js'; // Assuming ChatSession model exists
class Review extends Model {
    id;
    qaPairId;
    chatSessionId;
    answerHash;
    rating;
    notes;
    reviewerId;
    createdAt;
    updatedAt;
    // Association mixins
    getQAPair;
    getChatSession;
    getReviewer;
    // Static method for aggregation
    static async aggregateForQaPair(qaPairId) {
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
        const avgRating = result && typeof result.avgRating === 'string'
            ? parseFloat(result.avgRating)
            : result && result.avgRating !== null
                ? Number(result.avgRating)
                : null;
        const count = result ? Number(result.count) : 0;
        return { avgRating, count };
    }
}
Review.init({
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
}, {
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
                reviewerId: { [Op.ne]: null } // Use imported Op
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
});
// Associations
Review.belongsTo(QAPair, { foreignKey: 'qaPairId' });
QAPair.hasMany(Review, { foreignKey: 'qaPairId' });
Review.belongsTo(ChatSession, { foreignKey: 'chatSessionId' });
ChatSession.hasMany(Review, { foreignKey: 'chatSessionId' });
Review.belongsTo(AdminUser, { foreignKey: 'reviewerId', as: 'reviewer' });
AdminUser.hasMany(Review, { foreignKey: 'reviewerId' });
export { Review };
//# sourceMappingURL=review.model.js.map