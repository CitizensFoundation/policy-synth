import { CountryLink } from '../models/countryLink.model.js';
import { Topic } from '../models/topic.model.js';

interface LinkCreateDTO {
    topicId: number;
    countryCode: string;
    url: string;
    title?: string;
}

export class LinkService {
    async list(topicId?: number, countryCode?: string): Promise<CountryLink[]> {
        const where: any = {};
        if (topicId) {
            where.topicId = topicId;
        }
        if (countryCode) {
            where.countryCode = countryCode.toUpperCase();
        }
        return CountryLink.findAll({ where, include: [Topic] });
    }

    async findById(id: number): Promise<CountryLink | null> {
        return CountryLink.findByPk(id, { include: [Topic] });
    }

    async create(data: LinkCreateDTO): Promise<CountryLink> {
        return CountryLink.create(data);
    }

    async update(id: number, data: Partial<LinkCreateDTO>): Promise<[number]> {
        return CountryLink.update(data, { where: { id } });
    }

    async delete(id: number): Promise<number> {
        return CountryLink.destroy({ where: { id } });
    }

    async byCountry(topicId: number, countryCode: string): Promise<CountryLink[]> {
        return CountryLink.findAll({
            where: {
                topicId,
                countryCode: countryCode.toUpperCase(),
            },
            include: [Topic]
        });
    }
}