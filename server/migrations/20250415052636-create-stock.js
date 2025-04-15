"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Stocks", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      productId: {
        type: Sequelize.INTEGER,
      },
      productName: {
        type: Sequelize.STRING(100),
      },
      variantId: {
        type: Sequelize.INTEGER,
      },
      variantName: {
        type: Sequelize.STRING(100),
      },
      type: {
        type: Sequelize.ENUM("in", "out", "adjust"),
      },
      before_stock: {
        type: Sequelize.INTEGER,
      },
      adjust: {
        type: Sequelize.INTEGER,
      },
      after_stock: {
        type: Sequelize.INTEGER,
      },
      note: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable("Stocks");
  },
};
