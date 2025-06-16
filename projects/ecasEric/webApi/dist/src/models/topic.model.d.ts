import { Model, Optional } from 'sequelize';
interface TopicAttributes {
    id: number;
    slug: string;
    title: string;
    description?: string;
    language: string;
}
interface TopicCreationAttributes extends Optional<TopicAttributes, 'id' | 'description'> {
}
declare class Topic extends Model<TopicAttributes, TopicCreationAttributes> implements TopicAttributes {
    id: number;
    slug: string;
    title: string;
    description?: string;
    language: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export { Topic };
//# sourceMappingURL=topic.model.d.ts.map