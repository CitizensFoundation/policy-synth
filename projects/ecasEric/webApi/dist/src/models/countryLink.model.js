import { DataTypes, Model } from 'sequelize';
import { sequelize } from './index.js';
import { Topic } from './topic.model.js';
class CountryLink extends Model {
}
CountryLink.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    topicId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Topic,
            key: 'id',
        },
    },
    countryCode: {
        type: new DataTypes.STRING(2),
        allowNull: false,
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isUrl: true,
        },
    },
    title: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: 'country_links',
    sequelize,
    indexes: [
        { fields: ['topicId'] },
        { fields: ['countryCode'] },
        { fields: ['topicId', 'countryCode'] }
    ]
});
// Associations
Topic.hasMany(CountryLink, { foreignKey: 'topicId' });
CountryLink.belongsTo(Topic, { foreignKey: 'topicId' });
export { CountryLink };
//# sourceMappingURL=countryLink.model.js.map