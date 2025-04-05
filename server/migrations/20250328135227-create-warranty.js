"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("warranties", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING(100),
      },
      frame: {
        type: Sequelize.STRING(100),
      },
      lens: {
        type: Sequelize.STRING(100),
      },
      od: {
        type: Sequelize.STRING(100),
      },
      os: {
        type: Sequelize.STRING(100),
      },
      warranty_frame: {
        type: Sequelize.STRING(5),
      },
      warranty_lens: {
        type: Sequelize.STRING(5),
      },
      expire_frame: {
        type: Sequelize.DATE,
      },
      expire_lens: {
        type: Sequelize.DATE,
      },
      opticId: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable("warranties");
  },
};
