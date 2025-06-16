import { CountryLink } from '../models/countryLink.model.js';
interface LinkCreateDTO {
    topicId: number;
    countryCode: string;
    url: string;
    title?: string;
}
export declare class LinkService {
    list(topicId?: number, countryCode?: string): Promise<CountryLink[]>;
    findById(id: number): Promise<CountryLink | null>;
    create(data: LinkCreateDTO): Promise<CountryLink>;
    update(id: number, data: Partial<LinkCreateDTO>): Promise<[number]>;
    delete(id: number): Promise<number>;
    byCountry(topicId: number, countryCode: string): Promise<CountryLink[]>;
}
export {};
//# sourceMappingURL=linkService.d.ts.map