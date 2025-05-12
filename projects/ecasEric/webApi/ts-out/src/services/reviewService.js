import { Review } from '../models/review.model';
import { AdminUser } from '../models/adminUser.model';
import { QAPair } from '../models/qaPair.model';
import { Topic } from '../models/topic.model';
import { Op } from 'sequelize';
export class ReviewService {
    async create(data) {
        // Validation for context is in the model
        return Review.create(data);
    }
    async getAggregateForQaPair(qaPairId) {
        return Review.aggregateForQaPair(qaPairId);
    }
    async list({ page = 1, pageSize = 20, topicId, minRating }) {
        const offset = (page - 1) * pageSize;
        const where = {};
        const include = [
            { model: AdminUser, as: 'reviewer', attributes: ['id', 'email'] }, // Include reviewer info
            { model: QAPair, include: [Topic] } // Include QAPair and its Topic
            // Add ChatSession include if needed
        ];
        if (minRating !== undefined) {
            where.rating = { [Op.gte]: minRating };
        }
        if (topicId) {
            const qaPairsInTopic = await QAPair.findAll({
                where: { topicId },
                attributes: ['id'],
                raw: true,
            });
            const qaPairIds = qaPairsInTopic.map(qa => qa.id);
            if (qaPairIds.length > 0) {
                where.qaPairId = { [Op.in]: qaPairIds };
            }
            else {
                return { rows: [], count: 0 };
            }
        }
        return Review.findAndCountAll({
            where,
            include,
            limit: pageSize,
            offset,
            order: [['createdAt', 'DESC']]
        });
    }
    // Optional: Delete review (if requirements change)
    async delete(id) {
        return Review.destroy({ where: { id } });
    }
}
//# sourceMappingURL=reviewService.js.map