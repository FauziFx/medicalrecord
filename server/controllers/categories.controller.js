const { Category, Sequelize } = require("../models");
const fs = require("fs");
const Op = Sequelize.Op;

let self = {};

self.create = async (req, res, next) => {
  try {
    const { name, parentId } = req.body;

    const response = await Category.create({
      name,
      parentId,
    });

    res.status(201).json({
      success: true,
      message: "Category successfully added",
      response: response,
    });
  } catch (error) {
    next(error);
  }
};

self.get = async (req, res, next) => {
  try {
    const { type } = req.query; // Ambil parameter dari query URL

    const whereCondition = {};

    if (type == "main") {
      whereCondition.parentId = { [Op.eq]: null };
    } else if (type == "sub") {
      whereCondition.parentId = { [Op.ne]: null };
    }

    // Query untuk mendapatkan data pasien dengan pagination
    const response = await Category.findAll({
      where: whereCondition,
    });

    res.status(200).json({
      success: true,
      message: "Data Category found",
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

self.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, parentId } = req.body;

    const checkData = await Category.findByPk(id);
    if (!checkData) {
      return res.status(400).json({
        success: false,
        message: "Category not found!",
      });
    }

    checkData.name = name;
    checkData.parentId = parentId;
    checkData.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

self.delete = async (req, res, next) => {
  try {
    const { id } = req.params;

    const checkData = await Category.findByPk(id);
    if (!checkData) {
      return res.status(400).json({
        success: false,
        message: "Category not found!",
      });
    }

    await checkData.destroy();
    res.status(200).json({
      success: true,
      message: "Category Deleted Successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = self;
