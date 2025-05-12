import { Model, Optional, BelongsToGetAssociationMixin } from 'sequelize';
import { Topic } from './topic.model';
interface CountryLinkAttributes {
    id: number;
    topicId: number;
    countryCode: string;
    url: string;
    title?: string;
}
interface CountryLinkCreationAttributes extends Optional<CountryLinkAttributes, 'id' | 'title'> {
}
declare class CountryLink extends Model<CountryLinkAttributes, CountryLinkCreationAttributes> implements CountryLinkAttributes {
    id: number;
    topicId: number;
    countryCode: string;
    url: string;
    title?: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    getTopic: BelongsToGetAssociationMixin<Topic>;
}
export { CountryLink };
//# sourceMappingURL=countryLink.model.d.ts.map