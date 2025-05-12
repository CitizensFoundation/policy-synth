import { Sequelize, DataTypes, Model, Optional, BelongsToGetAssociationMixin } from 'sequelize';
import { sequelize } from './index.js';
import { Topic } from './topic.model.js';

interface CountryLinkAttributes {
  id: number;
  topicId: number;
  countryCode: string; // e.g., 'DE', 'FR'
  url: string;
  title?: string;
}

interface CountryLinkCreationAttributes extends Optional<CountryLinkAttributes, 'id' | 'title'> {}

class CountryLink extends Model<CountryLinkAttributes, CountryLinkCreationAttributes> implements CountryLinkAttributes {
  public id!: number;
  public topicId!: number;
  public countryCode!: string;
  public url!: string;
  public title?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association mixins
  public getTopic!: BelongsToGetAssociationMixin<Topic>;
}

CountryLink.init(
  {
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
  },
  {
    tableName: 'country_links',
    sequelize,
    indexes: [
        { fields: ['topicId'] },
        { fields: ['countryCode'] },
        { fields: ['topicId', 'countryCode'] }
    ]
  }
);

// Associations
Topic.hasMany(CountryLink, { foreignKey: 'topicId' });
CountryLink.belongsTo(Topic, { foreignKey: 'topicId' });

export { CountryLink };