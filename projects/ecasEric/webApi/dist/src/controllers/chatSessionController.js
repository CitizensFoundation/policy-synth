import { BaseController } from '@policysynth/api/controllers/baseController.js';
import { authMiddleware, roleGuard } from '../middlewares/authMiddleware.js';
import { ChatSessionService } from '../services/chatSessionService.js';
export class ChatSessionController extends BaseController {
    path = '/api/chat-sessions';
    chatSessionService = new ChatSessionService();
    constructor(wsClients) {
        super(wsClients);
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get(this.path, authMiddleware, roleGuard('admin'), this.list);
        this.router.get(`${this.path}/:id`, authMiddleware, roleGuard('admin'), this.getById);
    }
    list = async (req, res) => {
        const { page, pageSize, topicId, minRating } = req.query;
        try {
            const result = await this.chatSessionService.list({
                page: page ? Number(page) : 1,
                pageSize: pageSize ? Number(pageSize) : 20,
                topicId: topicId ? Number(topicId) : undefined,
                minRating: minRating ? Number(minRating) : undefined,
            });
            res.status(200).json(result);
        }
        catch (error) {
            console.error('Error listing chat sessions:', error);
            res.status(500).send(error.message || 'Internal Server Error');
        }
    };
    getById = async (req, res) => {
        const { id } = req.params;
        try {
            const session = await this.chatSessionService.findById(Number(id));
            if (!session) {
                return res.status(404).send('Chat session not found');
            }
            res.status(200).json(session);
        }
        catch (error) {
            console.error('Error getting chat session:', error);
            res.status(500).send(error.message || 'Internal Server Error');
        }
    };
}
//# sourceMappingURL=chatSessionController.js.map