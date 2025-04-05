"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("warrantyclaims", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      warrantyId: {
        type: Sequelize.INTEGER,
      },
      warranty_type: {
        type: Sequelize.STRING,
      },
      damage: {
        type: Sequelize.STRING,
      },
      repair: {
        type: Sequelize.STRING,
      },
      claim_date: {
        type: Sequelize.DATE,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("warrantyclaims");
  },
};
