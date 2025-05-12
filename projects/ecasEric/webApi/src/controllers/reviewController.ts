import { Request, Response } from 'express';
import { BaseController } from '@policysynth/api/controllers/baseController.js';
import WebSocket from 'ws';
import { authMiddleware, roleGuard } from '../middlewares/authMiddleware.js'; // Use roleGuard for admin-only routes
import { ReviewService } from '../services/reviewService.js';
import { stringify } from 'csv-stringify'; // For CSV export

export class ReviewController extends BaseController {
  public path = '/api/reviews';
  private reviewService = new ReviewService();

  constructor(wsClients: Map<string, WebSocket>) {
    super(wsClients);
    this.initializeRoutes();
  }

  public initializeRoutes() {
    // Anyone can post a review (potentially anonymous or requires login)
    // Using authMiddleware here assumes only logged-in users can review
    this.router.post(this.path, authMiddleware, this.createReview);

    // Get reviews (potentially filterable, maybe admin only?)
    // Add roleGuard('admin') if only admins can view all reviews
    this.router.get(this.path, authMiddleware, roleGuard('admin'), this.listReviews);

    // Optional: Route to export reviews (admin only)
    this.router.get(`${this.path}/export.csv`, authMiddleware, roleGuard('admin'), this.exportReviewsCSV);

    // Optional: Delete review (admin only)
    // this.router.delete(`${this.path}/:id`, authMiddleware, roleGuard('admin'), this.deleteReview);
  }

  private createReview = async (req: Request, res: Response) => {
    const { qaPairId, chatSessionId, answerHash, rating, notes } = req.body;
    const reviewerId = (req as any).authUser?.id; // Get user ID from authMiddleware

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).send('Valid rating (1-5) is required');
    }
    if (!qaPairId && !chatSessionId && !answerHash) {
        return res.status(400).send('Review context (qaPairId, chatSessionId, or answerHash) is required');
    }

    try {
      const review = await this.reviewService.create({
        qaPairId,
        chatSessionId,
        answerHash,
        rating,
        notes,
        reviewerId, // Link review to the logged-in user
      });
      res.status(201).json(review);
    } catch (error: any) {
      console.error('Error creating review:', error);
       if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).send('Review already submitted for this answer by this user.');
      }
      res.status(500).send(error.message ||'Internal Server Error');
    }
  };

  private listReviews = async (req: Request, res: Response) => {
    const { page, pageSize, topicId, minRating } = req.query;
    try {
      const result = await this.reviewService.list({
          page: page ? Number(page) : 1,
          pageSize: pageSize ? Number(pageSize) : 20,
          topicId: topicId ? Number(topicId) : undefined,
          minRating: minRating ? Number(minRating) : undefined,
      });
      res.status(200).json(result);
    } catch (error: any) {
      console.error('Error listing reviews:', error);
      res.status(500).send(error.message || 'Internal Server Error');
    }
  };

  private exportReviewsCSV = async (req: Request, res: Response) => {
    try {
        // Fetch all reviews (or apply filters as needed)
        // For large datasets, consider streaming directly from DB to CSV stringifier
        const { rows: reviews } = await this.reviewService.list({ pageSize: 10000, page: 1 }); // Get a large batch

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="reviews_export.csv"');

        const columns = [
            { key: 'id', header: 'Review ID' },
            { key: 'rating', header: 'Rating' },
            { key: 'notes', header: 'Notes' },
            { key: 'createdAt', header: 'Date' },
            { key: 'reviewerEmail', header: 'Reviewer Email' }, // From reviewer association
            { key: 'qaPairId', header: 'QA Pair ID' },
            { key: 'question', header: 'Question' }, // From QAPair association
            { key: 'answer', header: 'Answer' }, // From QAPair association
            { key: 'topicTitle', header: 'Topic' }, // From Topic association
            { key: 'answerHash', header: 'Answer Hash' },
            { key: 'chatSessionId', header: 'Chat Session ID' },
        ];

        const stringifier = stringify({ header: true, columns: columns.map(c => c.header) });

        stringifier.pipe(res);

        reviews.forEach(review => {
            const reviewData = review.get({ plain: true }) as any;
            stringifier.write({
                'Review ID': reviewData.id,
                'Rating': reviewData.rating,
                'Notes': reviewData.notes || '',
                'Date': reviewData.createdAt ? new Date(reviewData.createdAt).toISOString() : '',
                'Reviewer Email': reviewData.reviewer?.email || '',
                'QA Pair ID': reviewData.QAPair?.id || '',
                'Question': reviewData.QAPair?.question || '',
                'Answer': reviewData.QAPair?.answer || '',
                'Topic': reviewData.QAPair?.Topic?.title || '',
                'Answer Hash': reviewData.answerHash || '',
                'Chat Session ID': reviewData.chatSessionId || '',
            });
        });

        stringifier.end();

    } catch (error: any) {
        console.error('Error exporting reviews CSV:', error);
        res.status(500).send(error.message || 'Could not export reviews.');
    }
  };

  // private deleteReview = async (req: Request, res: Response) => {
  //   // TODO: Implement review deletion logic
  //   res.status(501).send('Not Implemented: Delete Review');
  // };
}