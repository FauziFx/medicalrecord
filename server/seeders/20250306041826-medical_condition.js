"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await queryInterface.bulkInsert("Medicalconditions", [
      {
        name: "Hipertensi",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Diabetes",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Kecelakaan",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Operasi Mata",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Katarak",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Lainnya",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("Medicalconditions", null, {});
  },
};
