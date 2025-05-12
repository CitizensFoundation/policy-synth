import { Sequelize, DataTypes, Model, Optional, BelongsToGetAssociationMixin } from 'sequelize';
import { sequelize } from './index';
import { Topic } from './topic.model';

// Define ENUM for question types
export enum QAPairQuestionType {
  LEGAL_INFORMATION = 'legal_information',
  LEGAL_ADVICE = 'legal_advice',
  LEGAL_ASSISTANCE = 'legal_assistance',
}

interface QAPairAttributes {
  id: number;
  topicId: number;
  question: string;
  answer: string;
  embeddingUuid?: string; // Link to vector store
  questionType?: QAPairQuestionType; // New field
  source?: string; // New field for provenance
}

interface QAPairCreationAttributes extends Optional<QAPairAttributes, 'id' | 'embeddingUuid' | 'questionType' | 'source'> {}

class QAPair extends Model<QAPairAttributes, QAPairCreationAttributes> implements QAPairAttributes {
  public id!: number;
  public topicId!: number;
  public question!: string;
  public answer!: string;
  public embeddingUuid?: string;
  public questionType?: QAPairQuestionType;
  public source?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association mixins
  public getTopic!: BelongsToGetAssociationMixin<Topic>;

  // Placeholder for vector store synchronization hook
  public static addHookForVectorSync(): void {
    QAPair.afterSave('syncWithVectorStore', async (qaPair, options) => {
      console.log(`Hook triggered: QAPair ${qaPair.id} saved. Need to sync vector store.`);
      // TODO: Implement actual call to vector store update/creation logic
      // This might involve calling a service that handles embedding and upserting
      // import { updateVectorForQaPair } from '../services/vectorSyncService';
      // await updateVectorForQaPair(qaPair);
    });
    QAPair.afterDestroy('removeFromVectorStore', async (qaPair, options) => {
       console.log(`Hook triggered: QAPair ${qaPair.id} deleted. Need to remove from vector store.`);
       // TODO: Implement actual call to vector store deletion logic
       // import { removeVectorForQaPair } from '../services/vectorSyncService';
       // await removeVectorForQaPair(qaPair);
    });
  }
}

QAPair.init(
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
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    embeddingUuid: {
      type: DataTypes.UUID,
      allowNull: true, // May not have an embedding initially or if vector store fails
      unique: true,
    },
    questionType: {
        type: DataTypes.ENUM(...Object.values(QAPairQuestionType)),
        allowNull: true,
    },
    source: {
        type: DataTypes.STRING,
        allowNull: true,
    }
  },
  {
    tableName: 'qa_pairs',
    sequelize,
  }
);

// Define associations
Topic.hasMany(QAPair, { foreignKey: 'topicId' });
QAPair.belongsTo(Topic, { foreignKey: 'topicId' });

// Activate hooks
// QAPair.addHookForVectorSync(); // Uncomment when vector sync service is ready

export { QAPair };