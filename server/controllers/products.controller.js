const { Product, Category, Variant, Sequelize } = require("../models");
const fs = require("fs");
const Op = Sequelize.Op;
const fn = Sequelize.fn;
const col = Sequelize.col;

let self = {};

self.get = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const offset = (page - 1) * limit;

    const { name, categoryId, status } = req.query;

    const whereCondition = {};

    if (name) {
      whereCondition.name = { [Op.like]: `%${name}%` };
    }

    if (status) {
      whereCondition.status = status;
    }

    if (categoryId) {
      if (categoryId != "null") {
        whereCondition.categoryId = categoryId;
      } else {
        whereCondition.categoryId = null;
      }
    }

    const { count, rows } = await Product.findAndCountAll({
      include: [
        {
          model: Category,
          attributes: ["name"],
          as: "categories",
        },
      ],
      where: whereCondition,
      limit,
      offset,
    });

    res.status(200).json({
      success: true,
      message: "Data Product found",
      data: rows,
      totalData: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = self;
