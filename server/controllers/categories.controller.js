const { Category, Product, Sequelize } = require("../models");
const fs = require("fs");
const Op = Sequelize.Op;
const fn = Sequelize.fn;
const col = Sequelize.col;

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
      attributes: [
        "id",
        "name",
        "parentId",
        [fn("COUNT", col("products.id")), "totalProducts"], // Total produk
      ],
      include: [
        {
          model: Category,
          as: "parent",
          attributes: ["id", "name"], // Relasi parent
        },
        {
          model: Category,
          as: "subCategories",
          attributes: ["id", "name"], // Relasi subcategories
        },
        {
          model: Product,
          as: "products",
          attributes: [], // Tidak perlu atribut produk
        },
      ],
      group: ["Category.id", "subCategories.id"],
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

    await Category.destroy({
      where: {
        parentId: id,
      },
    });

    res.status(200).json({
      success: true,
      message: "Category Deleted Successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = self;
