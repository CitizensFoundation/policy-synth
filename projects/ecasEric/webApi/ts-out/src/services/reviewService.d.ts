import { Review } from '../models/review.model';
interface ReviewCreateDTO {
    qaPairId?: number;
    chatSessionId?: number;
    answerHash?: string;
    rating: number;
    notes?: string;
    reviewerId?: number;
}
interface ListReviewsParams {
    page?: number;
    pageSize?: number;
    topicId?: number;
    minRating?: number;
}
export declare class ReviewService {
    create(data: ReviewCreateDTO): Promise<Review>;
    getAggregateForQaPair(qaPairId: number): Promise<{
        avgRating: number | null;
        count: number;
    }>;
    list({ page, pageSize, topicId, minRating }: ListReviewsParams): Promise<{
        rows: Review[];
        count: number;
    }>;
    delete(id: number): Promise<number>;
}
export {};
//# sourceMappingURL=reviewService.d.ts.map