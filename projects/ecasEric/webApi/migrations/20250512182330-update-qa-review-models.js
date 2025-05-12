'use strict';
const { QAPairQuestionType } = require('../src/models/qaPair.model'); // Import ENUM if needed
const { DataTypes, Op } = require('sequelize'); // Import DataTypes and Op

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('qa_pairs', 'questionType', {
        type: Sequelize.ENUM(...Object.values(QAPairQuestionType)),
        allowNull: true,
    });
    await queryInterface.addColumn('qa_pairs', 'source', {
        type: Sequelize.STRING,
        allowNull: true,
    });

    // Add unique index to reviews table
    await queryInterface.addIndex('reviews', {
        name: 'unique_review_per_user_per_answer',
        unique: true,
        fields: ['answerHash', 'reviewerId'],
        where: {
            answerHash: { [Op.ne]: null },
            reviewerId: { [Op.ne]: null }
        }
    });
  },

  async down (queryInterface, Sequelize) {
     await queryInterface.removeColumn('qa_pairs', 'questionType');
     await queryInterface.removeColumn('qa_pairs', 'source');
     await queryInterface.removeIndex('reviews', 'unique_review_per_user_per_answer');
  }
};
