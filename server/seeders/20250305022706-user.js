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
    // await queryInterface.bulkInsert("Users", [
    //   {
    //     name: "Admin Ganteng",
    //     email: "admin@mail.com",
    //     password:
    //       "$2b$10$F6DoiY.7ZziRjkB1LBONLeb7kdsekdwbpqfhkLppY6MPyySMUTP0W",
    //     role: "admin",
    //     status: 1,
    //     opticId: null,
    //     createdAt: new Date(),
    //     updatedAt: new Date(),
    //   },
    //   {
    //     name: "User Ganteng",
    //     email: "user@mail.com",
    //     password:
    //       "$2b$10$F6DoiY.7ZziRjkB1LBONLeb7kdsekdwbpqfhkLppY6MPyySMUTP0W",
    //     role: "user",
    //     status: 1,
    //     opticId: null,
    //     createdAt: new Date(),
    //     updatedAt: new Date(),
    //   },
    //   {
    //     name: "Admin Lab",
    //     email: "lab@mail.com",
    //     password:
    //       "$2b$10$F6DoiY.7ZziRjkB1LBONLeb7kdsekdwbpqfhkLppY6MPyySMUTP0W",
    //     role: "lab",
    //     status: 1,
    //     opticId: null,
    //     createdAt: new Date(),
    //     updatedAt: new Date(),
    //   },
    // ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    // await queryInterface.bulkDelete("Users", null, {});
  },
};
