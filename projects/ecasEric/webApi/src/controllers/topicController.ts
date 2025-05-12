import { Request, Response } from 'express';
import { BaseController } from '@policysynth/api/controllers/baseController.js';
import WebSocket from 'ws';
import { Topic } from '../models/topic.model'; // Assuming model exists
import { authMiddleware, roleGuard } from '../middlewares/authMiddleware';
import { Sequelize } from 'sequelize'; // Import Sequelize

export class TopicController extends BaseController {
  public path = '/api/topics';

  constructor(wsClients: Map<string, WebSocket>) {
    super(wsClients);
    this.initializeRoutes();
  }

  public initializeRoutes() {
    // Public route to get all topics (or filter by query params)
    this.router.get(this.path, this.listTopics);

    // Public route to get a single topic by ID or slug
    this.router.get(`${this.path}/:idOrSlug`, this.getTopic);

    // Protected routes for admins
    this.router.post(this.path, authMiddleware, roleGuard('admin'), this.createTopic);
    this.router.put(`${this.path}/:id`, authMiddleware, roleGuard('admin'), this.updateTopic);
    this.router.delete(`${this.path}/:id`, authMiddleware, roleGuard('admin'), this.deleteTopic);
  }

  private listTopics = async (req: Request, res: Response) => {
    try {
      // TODO: Add pagination, filtering (e.g., by language)
      const topics = await Topic.findAll();
      res.status(200).json(topics);
    } catch (error) {
      console.error('Error listing topics:', error);
      res.status(500).send('Internal Server Error');
    }
  };

  private getTopic = async (req: Request, res: Response) => {
    const { idOrSlug } = req.params;
    try {
      // Attempt to convert idOrSlug to a number for ID-based search
      const id = parseInt(idOrSlug, 10);
      let topic;
      if (!isNaN(id)) {
        topic = await Topic.findByPk(id);
      }
      if (!topic) {
        // If not found by ID, or if idOrSlug was not a number, search by slug
        topic = await Topic.findOne({ where: { slug: idOrSlug } });
      }

      if (!topic) {
        return res.status(404).send('Topic not found');
      }
      res.status(200).json(topic);
    } catch (error) {
      console.error(`Error getting topic ${idOrSlug}:`, error);
      res.status(500).send('Internal Server Error');
    }
  };

  private createTopic = async (req: Request, res: Response) => {
    // TODO: Implement topic creation logic
    // Example: const { title, slug, description, language } = req.body;
    // const newTopic = await Topic.create({ title, slug, description, language });
    res.status(501).send('Not Implemented');
  };

  private updateTopic = async (req: Request, res: Response) => {
    // TODO: Implement topic update logic
    res.status(501).send('Not Implemented');
  };

  private deleteTopic = async (req: Request, res: Response) => {
    // TODO: Implement topic deletion logic
    res.status(501).send('Not Implemented');
  };
}