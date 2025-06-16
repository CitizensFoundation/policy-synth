import { DataTypes, Model } from 'sequelize';
import { sequelize } from './index.js'; // Adjust path as necessary
class Topic extends Model {
    id;
    slug;
    title;
    description;
    language;
    createdAt;
    updatedAt;
}
Topic.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    slug: {
        type: new DataTypes.STRING(128),
        allowNull: false,
        unique: true,
    },
    title: {
        type: new DataTypes.STRING(255),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    language: {
        type: new DataTypes.STRING(5),
        allowNull: false,
        defaultValue: 'en',
    },
}, {
    tableName: 'topics',
    sequelize, // this bit is important
});
export { Topic };
//# sourceMappingURL=topic.model.js.map