import { YpServerApi } from '@yrpri/webapp/common/YpServerApi.js';
import { authStoreInstance } from '../services/authStore.js'; // Assuming standard services path

// Define types for your data
export interface TopicData {
    id: number;
    slug: string;
    title: string;
    description?: string;
    language?: string;
}

// --- QA Interfaces (match backend DTOs/Models) ---
export enum QAPairQuestionTypeFE {
  LEGAL_INFORMATION = 'legal_information',
  LEGAL_ADVICE = 'legal_advice',
  LEGAL_ASSISTANCE = 'legal_assistance',
}

export interface QAPairData {
    id: number;
    topicId: number;
    question: string;
    answer: string;
    questionType?: QAPairQuestionTypeFE;
    source?: string;
    embeddingUuid?: string;
    createdAt?: string; // Dates are usually strings from JSON
    updatedAt?: string;
    Topic?: TopicData; // If topic is included
    avgRating?: number | null; // For aggregated reviews
    reviewCount?: number;
}

export interface QACreateDTO {
    topicId: number;
    question: string;
    answer: string;
    questionType?: QAPairQuestionTypeFE;
    source?: string;
}

export interface QAListResponse {
    rows: QAPairData[];
    count: number;
}

// --- Link Interfaces ---
export interface LinkData {
    id: number;
    topicId: number;
    countryCode: string;
    url: string;
    title?: string;
    createdAt?: string;
    updatedAt?: string;
    Topic?: TopicData;
}
export interface LinkCreateDTO {
    topicId: number;
    countryCode: string;
    url: string;
    title?: string;
}

// --- Review Interfaces ---
export interface ReviewData {
    id: number;
    qaPairId?: number;
    chatSessionId?: number;
    answerHash?: string;
    rating: number;
    notes?: string;
    reviewerId?: number;
    createdAt?: string;
    updatedAt?: string;
    reviewer?: { email: string }; // Example of included user info
    QAPair?: QAPairData;
}
export interface ReviewCreateDTO {
    qaPairId?: number;
    chatSessionId?: number;
    answerHash?: string;
    rating: number;
    notes?: string;
}
export interface ReviewListResponse {
    rows: ReviewData[];
    count: number;
}

export class AdminServerApi extends YpServerApi {
  constructor(urlPath: string = '/api') {
    super();
    this.baseUrlPath = urlPath;
  }

  // Override fetchWrapper to include Authorization header
  // Match the signature from YpServerApi base class
  override async fetchWrapper(
    url: string,
    options: RequestInit = {},
    showUserError = true, // Parameter from YpServerApi
    errorId?: string,     // Parameter from YpServerApi
    throwError = false    // Parameter from YpServerApi
  ): Promise<any> { // YpServerApi returns Promise<any>
    const token = authStoreInstance.getToken();
    if (token && !url.includes('/auth/login')) { // Don't add token to login requests
      if (!options.headers) {
        options.headers = new Headers();
      }
      (options.headers as Headers).set('Authorization', `Bearer ${token}`);
       // Set Content-Type if body exists and it's not already set
       if (options.body && !(options.headers as Headers).has('Content-Type')) {
         (options.headers as Headers).set('Content-Type', 'application/json');
       }
    }

    try {
      // Call the original fetchWrapper with its expected signature
      const response = await super.fetchWrapper(
        url,
        options,
        showUserError,
        errorId,
        throwError
      );
      return response;
    } catch (error: any) {
      // Handle 401 Unauthorized specifically
      if (error.status === 401 && !url.includes('/auth/login')) {
        console.warn('API returned 401 Unauthorized. Logging out.');
        authStoreInstance.logout();
        window.location.href = '/admin/login';
      }
      // Re-throw or handle as per base class expectation (often base class handles errors)
      if (throwError) {
        throw error;
      } else {
        // Base class might handle showing user errors, just log here
        console.error("FetchWrapper Error (AdminApi):", error); // Corrected logging
        return undefined; // Or return appropriate error indicator
      }
    }
  }

  // --- Auth ---
  async login(email: string, password: string): Promise<any> {
    // Use the *overridden* fetchWrapper which knows not to add tokens to /login
    return this.fetchWrapper(`${this.baseUrlPath}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    }, true, 'login-error', true); // Show user error, provide id, throw error on failure
  }


  // --- Topic CRUD --- (Return specific types)
  async getTopics(): Promise<TopicData[]> {
    // Cast the 'any' from fetchWrapper
    return await this.fetchWrapper(`${this.baseUrlPath}/topics`) as TopicData[];
  }

  async getTopic(idOrSlug: string | number): Promise<TopicData> {
    return await this.fetchWrapper(
      `${this.baseUrlPath}/topics/${idOrSlug}`
    ) as TopicData;
  }

  async createTopic(topicData: Omit<TopicData, 'id'>): Promise<TopicData> {
    return await this.fetchWrapper(`${this.baseUrlPath}/topics`, {
      method: 'POST',
      body: JSON.stringify(topicData),
    }, true, 'topic-create-error', true) as TopicData;
  }

  async updateTopic(id: number, topicData: Partial<Omit<TopicData, 'id'>>): Promise<TopicData> {
    return await this.fetchWrapper(`${this.baseUrlPath}/topics/${id}`, {
        method: 'PUT',
        body: JSON.stringify(topicData),
    }, true, 'topic-update-error', true) as TopicData;
  }

  async deleteTopic(id: number): Promise<void> {
    // fetchWrapper returns Promise<any>, cast or ignore for void
    await this.fetchWrapper(`${this.baseUrlPath}/topics/${id}`, {
        method: 'DELETE',
    }, true, 'topic-delete-error', false); // Don't throw, just check status in component
  }

  // --- QA CRUD ---
  async listQAPairs(topicId?: number, page?: number, pageSize?: number): Promise<QAListResponse> {
    const params = new URLSearchParams();
    if (topicId !== undefined) params.set('topicId', String(topicId));
    if (page !== undefined) params.set('page', String(page));
    if (pageSize !== undefined) params.set('pageSize', String(pageSize));
    const queryString = params.toString();
    return await this.fetchWrapper(`${this.baseUrlPath}/qa${queryString ? '?' + queryString : ''}`) as QAListResponse;
  }

  async getQAPair(id: number): Promise<QAPairData> {
      return await this.fetchWrapper(`${this.baseUrlPath}/qa/${id}`) as QAPairData;
  }

  async createQAPair(qaData: QACreateDTO): Promise<QAPairData> {
    return await this.fetchWrapper(`${this.baseUrlPath}/qa`, {
        method: 'POST',
        body: JSON.stringify(qaData),
    }, true, 'qa-create-error', true) as QAPairData;
  }

  async updateQAPair(id: number, qaData: Partial<QACreateDTO>): Promise<{ message: string }> {
    return await this.fetchWrapper(`${this.baseUrlPath}/qa/${id}`, {
        method: 'PUT',
        body: JSON.stringify(qaData),
    }, true, 'qa-update-error', true) as { message: string };
  }

  async deleteQAPair(id: number): Promise<{ message: string }> {
    return await this.fetchWrapper(`${this.baseUrlPath}/qa/${id}`, {
        method: 'DELETE',
    }, true, 'qa-delete-error', false) as { message: string }; // Don't throw for delete usually
  }

  async importXlsx(topicId: number, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('topicId', String(topicId));
    // fetchWrapper needs adjustment for FormData (no Content-Type header)
    const token = authStoreInstance.getToken();
    const headers = new Headers();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    // Let browser set Content-Type for FormData
    return super.fetchWrapper(`${this.baseUrlPath}/qa/import-xlsx`, {
        method: 'POST',
        body: formData,
        headers: headers, // Pass only auth if needed
    }, true, 'xlsx-import-error', true);
  }

  // --- Link CRUD ---
  async listLinks(topicId?: number, countryCode?: string): Promise<LinkData[]> {
    const params = new URLSearchParams();
    if (topicId !== undefined) params.set('topicId', String(topicId));
    if (countryCode) params.set('countryCode', countryCode);
    const queryString = params.toString();
    return await this.fetchWrapper(`${this.baseUrlPath}/links${queryString ? '?' + queryString : ''}`) as LinkData[];
  }

  async createLink(linkData: LinkCreateDTO): Promise<LinkData> {
    return await this.fetchWrapper(`${this.baseUrlPath}/links`, {
        method: 'POST',
        body: JSON.stringify(linkData),
    }, true, 'link-create-error', true) as LinkData;
  }

  async updateLink(id: number, linkData: Partial<LinkCreateDTO>): Promise<{ message: string }> {
    return await this.fetchWrapper(`${this.baseUrlPath}/links/${id}`, {
        method: 'PUT',
        body: JSON.stringify(linkData),
    }, true, 'link-update-error', true) as { message: string };
  }

  async deleteLink(id: number): Promise<{ message: string }> {
    return await this.fetchWrapper(`${this.baseUrlPath}/links/${id}`, {
        method: 'DELETE',
    }, true, 'link-delete-error', false) as { message: string };
  }

  // --- Review CRUD ---
  async createReview(reviewData: ReviewCreateDTO): Promise<ReviewData> {
    return await this.fetchWrapper(`${this.baseUrlPath}/reviews`, {
        method: 'POST',
        body: JSON.stringify(reviewData),
    }, true, 'review-create-error', true) as ReviewData;
  }

   async listReviews(params: { topicId?: number, page?: number, pageSize?: number, minRating?: number } = {}): Promise<ReviewListResponse> {
     const query = new URLSearchParams();
     if (params.topicId !== undefined) query.set('topicId', String(params.topicId));
     if (params.page !== undefined) query.set('page', String(params.page));
     if (params.pageSize !== undefined) query.set('pageSize', String(params.pageSize));
     if (params.minRating !== undefined) query.set('minRating', String(params.minRating));
     const queryString = query.toString();
     return await this.fetchWrapper(`${this.baseUrlPath}/reviews${queryString ? '?' + queryString : ''}`) as ReviewListResponse;
   }

   async exportReviewsCSV(): Promise<Blob> {
     // fetchWrapper returns Promise<any>. We need to handle Blob response.
     // For this, we might need a modified fetchWrapper or a direct fetch call.
     const token = authStoreInstance.getToken();
     const headers = new Headers({ 'Accept': 'text/csv' });
     if (token) {
       headers.set('Authorization', `Bearer ${token}`);
     }
     const response = await fetch(`${this.baseUrlPath}/reviews/export.csv`, { headers });
     if (!response.ok) {
         throw new Error(`CSV Export failed: ${response.statusText}`);
     }
     return response.blob();
   }
}

export const adminServerApi = new AdminServerApi();
