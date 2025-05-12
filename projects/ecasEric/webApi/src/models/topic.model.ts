import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './index.js'; // Adjust path as necessary

interface TopicAttributes {
  id: number;
  slug: string;
  title: string;
  description?: string;
  language: string;
}

interface TopicCreationAttributes extends Optional<TopicAttributes, 'id' | 'description'> {}

class Topic extends Model<TopicAttributes, TopicCreationAttributes> implements TopicAttributes {
  public id!: number;
  public slug!: string;
  public title!: string;
  public description?: string;
  public language!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Topic.init(
  {
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
  },
  {
    tableName: 'topics',
    sequelize, // this bit is important
  }
);

export { Topic };