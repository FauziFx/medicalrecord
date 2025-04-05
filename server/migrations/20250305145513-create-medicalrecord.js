"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("medicalrecords", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      od: {
        type: Sequelize.STRING(100),
      },
      os: {
        type: Sequelize.STRING(100),
      },
      far_pd: {
        type: Sequelize.INTEGER,
      },
      near_pd: {
        type: Sequelize.INTEGER,
      },
      visit_date: {
        type: Sequelize.DATE,
      },
      checked_by: {
        type: Sequelize.STRING(50),
      },
      note: {
        type: Sequelize.STRING,
      },
      image: {
        type: Sequelize.STRING,
      },
      is_olddata: {
        type: Sequelize.INTEGER,
      },
      patientId: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable("medicalrecords");
  },
};
