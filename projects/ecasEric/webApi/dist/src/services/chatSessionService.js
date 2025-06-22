import { ChatSession } from '../models/chatSession.model.js';
import { Review } from '../models/review.model.js';
import { AdminUser } from '../models/adminUser.model.js';
import { Op } from 'sequelize';
export class ChatSessionService {
    async list({ page = 1, pageSize = 20, topicId, minRating }) {
        const offset = (page - 1) * pageSize;
        const reviewWhere = {};
        if (minRating !== undefined) {
            reviewWhere.rating = { [Op.gte]: minRating };
        }
        return ChatSession.findAndCountAll({
            where: topicId ? { topicId } : undefined,
            limit: pageSize,
            offset,
            order: [['createdAt', 'DESC']],
            include: [{
                    model: Review,
                    where: Object.keys(reviewWhere).length > 0 ? reviewWhere : undefined,
                    required: minRating !== undefined,
                    include: [{ model: AdminUser, as: 'reviewer', attributes: ['id', 'email'] }]
                }]
        });
    }
    async findById(id) {
        return ChatSession.findByPk(id, {
            include: [{ model: Review, include: [{ model: AdminUser, as: 'reviewer', attributes: ['id', 'email'] }] }]
        });
    }
}
//# sourceMappingURL=chatSessionService.js.map