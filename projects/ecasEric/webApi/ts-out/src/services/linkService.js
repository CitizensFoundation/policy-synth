import { CountryLink } from '../models/countryLink.model';
import { Topic } from '../models/topic.model';
export class LinkService {
    async list(topicId, countryCode) {
        const where = {};
        if (topicId) {
            where.topicId = topicId;
        }
        if (countryCode) {
            where.countryCode = countryCode.toUpperCase();
        }
        return CountryLink.findAll({ where, include: [Topic] });
    }
    async findById(id) {
        return CountryLink.findByPk(id, { include: [Topic] });
    }
    async create(data) {
        return CountryLink.create(data);
    }
    async update(id, data) {
        return CountryLink.update(data, { where: { id } });
    }
    async delete(id) {
        return CountryLink.destroy({ where: { id } });
    }
    async byCountry(topicId, countryCode) {
        return CountryLink.findAll({
            where: {
                topicId,
                countryCode: countryCode.toUpperCase(),
            },
            include: [Topic]
        });
    }
}
//# sourceMappingURL=linkService.js.map