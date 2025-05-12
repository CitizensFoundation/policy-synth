import { Request, Response } from 'express';
import { BaseController } from '@policysynth/api/controllers/baseController.js';
import WebSocket from 'ws';
import { Topic } from '../models/topic.model.js'; // Assuming model exists
import { authMiddleware, roleGuard } from '../middlewares/authMiddleware.js';
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
    try {
      const { title, slug, description, language } = req.body;
      if (!title || !slug) {
        return res.status(400).send('Missing required fields: title and slug');
      }
      const newTopic = await Topic.create({ title, slug, description, language });
      res.status(201).json(newTopic);
    } catch (error: any) { // Added :any to error for broader compatibility in catch
        // Check if the error is a Sequelize UniqueConstraintError
        if (error.name === 'SequelizeUniqueConstraintError') { // Check by error.name
            console.error('Error creating topic (Unique Constraint):', error);
            return res.status(409).send('Topic with this slug already exists.'); // 409 Conflict
        }
      console.error('Error creating topic:', error);
      res.status(500).send('Internal Server Error');
    }
  };

  private updateTopic = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, slug, description, language } = req.body;

    try {
      const topicId = parseInt(id, 10);
      if (isNaN(topicId)) {
        return res.status(400).send('Invalid topic ID');
      }

      const topic = await Topic.findByPk(topicId);

      if (!topic) {
        return res.status(404).send('Topic not found');
      }

      // Prepare update data, excluding undefined fields to avoid overwriting with null
      const updateData = {}; // Let TypeScript infer the type
      if (title !== undefined) (updateData as any).title = title; // Use type assertion for assignment
      if (slug !== undefined) (updateData as any).slug = slug;
      if (description !== undefined) (updateData as any).description = description;
      if (language !== undefined) (updateData as any).language = language;

      // Only update if there is data to update
      if (Object.keys(updateData).length === 0) {
          return res.status(400).send('No update data provided');
      }

      await topic.update(updateData);

      res.status(200).json(topic); // Return the updated topic
    } catch (error: any) {
       if (error.name === 'SequelizeUniqueConstraintError') { // Check by error.name
            console.error('Error updating topic (Unique Constraint):', error);
            return res.status(409).send('Topic with this slug already exists.'); // 409 Conflict
        }
      console.error(`Error updating topic ${id}:`, error);
      res.status(500).send('Internal Server Error');
    }
  };

  private deleteTopic = async (req: Request, res: Response) => {
    // TODO: Implement topic deletion logic
    res.status(501).send('Not Implemented');
  };
}