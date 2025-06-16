import { DataTypes, Model } from 'sequelize';
import { sequelize } from './index.js';
import { Topic } from './topic.model.js';
// Define ENUM for question types
export var QAPairQuestionType;
(function (QAPairQuestionType) {
    QAPairQuestionType["LEGAL_INFORMATION"] = "legal_information";
    QAPairQuestionType["LEGAL_ADVICE"] = "legal_advice";
    QAPairQuestionType["LEGAL_ASSISTANCE"] = "legal_assistance";
})(QAPairQuestionType || (QAPairQuestionType = {}));
class QAPair extends Model {
    id;
    topicId;
    question;
    answer;
    embeddingUuid;
    questionType;
    source;
    createdAt;
    updatedAt;
    // Association mixins
    getTopic;
    // Placeholder for vector store synchronization hook
    static addHookForVectorSync() {
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
QAPair.init({
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
}, {
    tableName: 'qa_pairs',
    sequelize,
});
// Define associations
Topic.hasMany(QAPair, { foreignKey: 'topicId' });
QAPair.belongsTo(Topic, { foreignKey: 'topicId' });
// Activate hooks
// QAPair.addHookForVectorSync(); // Uncomment when vector sync service is ready
export { QAPair };
//# sourceMappingURL=qaPair.model.js.map