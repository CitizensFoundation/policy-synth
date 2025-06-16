import { ChatSession } from '../models/chatSession.model.js';
import { Review } from '../models/review.model.js';
import { AdminUser } from '../models/adminUser.model.js';

interface ListParams {
  page?: number;
  pageSize?: number;
}

export class ChatSessionService {
  async list({ page = 1, pageSize = 20 }: ListParams) {
    const offset = (page - 1) * pageSize;
    return ChatSession.findAndCountAll({
      limit: pageSize,
      offset,
      order: [['createdAt', 'DESC']],
      include: [{ model: Review, include: [{ model: AdminUser, as: 'reviewer', attributes: ['id', 'email'] }] }]
    });
  }

  async findById(id: number) {
    return ChatSession.findByPk(id, {
      include: [{ model: Review, include: [{ model: AdminUser, as: 'reviewer', attributes: ['id', 'email'] }] }]
    });
  }
}
