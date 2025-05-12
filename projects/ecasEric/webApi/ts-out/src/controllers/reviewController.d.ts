import { BaseController } from '@policysynth/api/controllers/baseController.js';
import WebSocket from 'ws';
export declare class ReviewController extends BaseController {
    path: string;
    private reviewService;
    constructor(wsClients: Map<string, WebSocket>);
    initializeRoutes(): void;
    private createReview;
    private listReviews;
    private exportReviewsCSV;
}
//# sourceMappingURL=reviewController.d.ts.map