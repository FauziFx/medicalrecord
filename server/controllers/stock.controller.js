const { Stock, Variant, Category, Product, Sequelize } = require("../models");
const { Op, literal } = Sequelize;

let self = {};

self.getManagements = async (req, res, next) => {
  try {
    const { name, categoryId, status = "all" } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const offset = (page - 1) * limit;

    const whereProduct = {};
    const whereCondition = { track_stock: 1 };

    if (name) {
      whereProduct.name = { [Op.like]: `%${name}%` };
    }

    if (categoryId) {
      whereProduct.categoryId = categoryId;
    }

    if (status === "low") {
      whereCondition.stock = {
        [Op.gt]: 0,
        [Op.lte]: literal("minimum_stock"),
      };
    } else if (status === "out") {
      whereCondition.stock = { [Op.lte]: 0 };
    } else if (status === "all") {
      whereCondition[Op.or] = [
        {
          stock: {
            [Op.gt]: 0,
            [Op.lte]: literal("minimum_stock"),
          },
        },
        { stock: { [Op.lte]: 0 } },
      ];
    }

    const { count, rows } = await Variant.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name"],
          where: whereProduct,
          include: [
            {
              model: Category,
              as: "categories",
              attributes: ["name"],
            },
          ],
        },
      ],
      limit,
      offset,
      order: [["stock", "ASC"]],
    });

    res.status(200).json({
      success: true,
      message: "Data found",
      data: rows,
      totalData: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    next(error);
  }
};

self.getAdjustments = async (req, res, next) => {
  try {
    const { productName } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const offset = (page - 1) * limit;

    const whereCondition = {};

    if (productName) {
      whereCondition.productName = { [Op.like]: `%${productName}%` };
    }

    const { count, rows } = await Stock.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      message: "Data found",
      data: rows,
      totalData: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    next(error);
  }
};

self.createAdjustment = async (req, res, next) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or empty data provided." });
    }

    // Optional: validate each item here if needed

    const inserted = await Stock.bulkCreate(items);

    const updatePromises = items.map((item) =>
      Variant.update(
        { stock: item.after_stock },
        { where: { id: item.variantId } }
      )
    );

    await Promise.all(updatePromises);

    return res.status(201).json({
      success: true,
      message: "Stock adjustments have been saved successfully.",
      data: inserted,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = self;
