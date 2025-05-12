import { Request, Response } from 'express';
import { BaseController } from '@policysynth/api/controllers/baseController.js';
import WebSocket from 'ws';
import { authMiddleware, roleGuard } from '../middlewares/authMiddleware';
import { LinkService } from '../services/linkService.js';

export class LinkController extends BaseController {
  public path = '/api/links';
  private linkService = new LinkService();

  constructor(wsClients: Map<string, WebSocket>) {
    super(wsClients);
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get(this.path, this.listLinks);
    this.router.get(`${this.path}/:id`, this.getLink);
    this.router.post(this.path, authMiddleware, roleGuard('admin'), this.createLink);
    this.router.put(`${this.path}/:id`, authMiddleware, roleGuard('admin'), this.updateLink);
    this.router.delete(`${this.path}/:id`, authMiddleware, roleGuard('admin'), this.deleteLink);
  }

  private listLinks = async (req: Request, res: Response) => {
    const { topicId, countryCode } = req.query;
    try {
      const links = await this.linkService.list(
        topicId ? Number(topicId) : undefined,
        countryCode ? String(countryCode) : undefined
      );
      res.status(200).json(links);
    } catch (error: any) {
      console.error('Error listing links:', error);
      res.status(500).send(error.message || 'Internal Server Error');
    }
  };

  private getLink = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const link = await this.linkService.findById(Number(id));
      if (!link) {
        return res.status(404).send('Link not found');
      }
      res.status(200).json(link);
    } catch (error: any) {
      console.error(`Error getting link ${id}:`, error);
      res.status(500).send(error.message || 'Internal Server Error');
    }
  };

  private createLink = async (req: Request, res: Response) => {
    const { topicId, countryCode, url, title } = req.body;
    if (!topicId || !countryCode || !url) {
        return res.status(400).send('topicId, countryCode, and url are required');
    }
    try {
      const newLink = await this.linkService.create({ topicId, countryCode, url, title });
      res.status(201).json(newLink);
    } catch (error: any) {
      console.error('Error creating link:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ message: 'Validation Error', details: error.errors });
      }
      res.status(500).send(error.message || 'Internal Server Error');
    }
  };

  private updateLink = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const [affectedCount] = await this.linkService.update(Number(id), req.body);
      if (affectedCount === 0) {
        return res.status(404).send('Link not found or no changes made');
      }
      res.status(200).json({ message: 'Link updated successfully' });
    } catch (error: any) {
      console.error(`Error updating link ${id}:`, error);
       if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ message: 'Validation Error', details: error.errors });
      }
      res.status(500).send(error.message || 'Internal Server Error');
    }
  };

  private deleteLink = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const affectedCount = await this.linkService.delete(Number(id));
      if (affectedCount === 0) {
        return res.status(404).send('Link not found');
      }
      res.status(200).json({ message: 'Link deleted successfully' });
    } catch (error: any) {
      console.error(`Error deleting link ${id}:`, error);
      res.status(500).send(error.message || 'Internal Server Error');
    }
  };
}