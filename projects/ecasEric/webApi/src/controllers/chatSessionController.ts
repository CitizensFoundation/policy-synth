import { Request, Response } from 'express';
import { BaseController } from '@policysynth/api/controllers/baseController.js';
import WebSocket from 'ws';
import { authMiddleware, roleGuard } from '../middlewares/authMiddleware.js';
import { ChatSessionService } from '../services/chatSessionService.js';

export class ChatSessionController extends BaseController {
  public path = '/api/chat-sessions';
  private chatSessionService = new ChatSessionService();

  constructor(wsClients: Map<string, WebSocket>) {
    super(wsClients);
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get(this.path, authMiddleware, roleGuard('admin'), this.list);
    this.router.get(`${this.path}/:id`, authMiddleware, roleGuard('admin'), this.getById);
  }

  private list = async (req: Request, res: Response) => {
    const { page, pageSize, topicId, minRating } = req.query;
    try {
      const result = await this.chatSessionService.list({
        page: page ? Number(page) : 1,
        pageSize: pageSize ? Number(pageSize) : 20,
        topicId: topicId ? Number(topicId) : undefined,
        minRating: minRating ? Number(minRating) : undefined,
      });
      res.status(200).json(result);
    } catch (error: any) {
      console.error('Error listing chat sessions:', error);
      res.status(500).send(error.message || 'Internal Server Error');
    }
  };

  private getById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const session = await this.chatSessionService.findById(Number(id));
      if (!session) {
        return res.status(404).send('Chat session not found');
      }
      res.status(200).json(session);
    } catch (error: any) {
      console.error('Error getting chat session:', error);
      res.status(500).send(error.message || 'Internal Server Error');
    }
  };
}
