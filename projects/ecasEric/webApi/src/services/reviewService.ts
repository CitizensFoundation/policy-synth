import { Review } from '../models/review.model.js';
import { AdminUser } from '../models/adminUser.model.js';
import { QAPair } from '../models/qaPair.model.js';
import { Topic } from '../models/topic.model.js';
import { Op } from 'sequelize';

interface ReviewCreateDTO {
    qaPairId?: number;
    chatSessionId?: number;
    answerHash?: string;
    rating: number;
    notes?: string;
    reviewerId?: number; // Usually comes from authenticated user
}

interface ListReviewsParams {
    page?: number;
    pageSize?: number;
    topicId?: number;
    minRating?: number;
    // Add other filters like date range, reviewerId etc.
}

export class ReviewService {
    async create(data: ReviewCreateDTO): Promise<Review> {
        // Validation for context is in the model
        return Review.create(data);
    }

    async getAggregateForQaPair(qaPairId: number): Promise<{ avgRating: number | null; count: number }> {
        return Review.aggregateForQaPair(qaPairId);
    }

    async list({ page = 1, pageSize = 20, topicId, minRating }: ListReviewsParams): Promise<{ rows: Review[]; count: number }> {
        const offset = (page - 1) * pageSize;
        const where: any = {};
        const include: any[] = [
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
            } else {
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
    async delete(id: number): Promise<number> {
        return Review.destroy({ where: { id } });
    }
}