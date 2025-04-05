const { medicalcondition, Sequelize } = require("../models");

let self = {};

// Get ALl
self.get = async (req, res, next) => {
  try {
    const response = await medicalcondition.findAll({
      order: [["createdAt"]],
    });
    res.status(200).json({
      success: true,
      message: "Data found",
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = self;
