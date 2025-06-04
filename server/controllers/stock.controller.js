const { Stock, Variant, Category, Product, Sequelize } = require("../models");
const { Op, fn, col, literal, where } = Sequelize;

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

self.getStockLens = async (req, res, next) => {
  try {
    const { name, type, coating } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const offset = (page - 1) * limit;

    const whereCondition = {};

    const nameCondition = name ? { [Op.like]: `%${name}%` } : null;

    let typeCondition = null;

    if (type) {
      if (type == "sv") {
        typeCondition = {
          [Op.or]: [
            { [Op.like]: "%sv%" },
            { [Op.like]: "%cyl%" },
            { [Op.like]: "%gia%" },
          ],
        };
      } else if (type == "kt") {
        typeCondition = { [Op.like]: "%kt%" };
      } else if (type == "prog") {
        typeCondition = { [Op.like]: "%prog%" };
      }
    }

    let coatingCondition = null;

    if (coating) {
      // hanya aktif jika type dipilih
      if (coating == "putih") {
        coatingCondition = { [Op.like]: "%putih%" };
      } else if (coating == "mc") {
        coatingCondition = {
          [Op.or]: [
            { [Op.like]: "%crmc%" },
            { [Op.like]: "%pmc%" },
            { [Op.like]: "%carbonat%" },
            { [Op.like]: "%flexi%" },
            { [Op.like]: "%perform%" },
            { [Op.like]: "%essilor%" },
          ],
        };
      } else if (coating == "blue") {
        coatingCondition = {
          [Op.and]: [
            {
              [Op.or]: [{ [Op.like]: "%blue%" }, { [Op.like]: "%uv%" }],
            },
            { [Op.notLike]: "%sun%" },
            { [Op.notLike]: "%evo%" },
            { [Op.notLike]: "%photo%" },
          ],
        };
      } else if (coating == "photo") {
        coatingCondition = {
          [Op.and]: [{ [Op.like]: "%photo%" }, { [Op.notLike]: "%blue%" }],
        };
      } else if (coating == "bluecromic") {
        coatingCondition = {
          [Op.or]: [
            { [Op.like]: "%photo blue%" },
            { [Op.like]: "%evo%" },
            { [Op.like]: "%sun blue%" },
          ],
        };
      }
    }

    // Gabungkan semua kondisi ke dalam satu AND utama
    const conditions = [];

    if (nameCondition) conditions.push(nameCondition);
    if (typeCondition) conditions.push(typeCondition);
    if (coatingCondition) conditions.push(coatingCondition);

    if (conditions.length > 0) {
      whereCondition.productName = { [Op.and]: conditions };
    }

    const rows = await Variant.findAll({
      attributes: ["productName"],
      include: {
        model: Product,
        attributes: [],
        as: "product",
        where: { categoryId: 4 },
      },
      where: whereCondition,
      limit,
      offset,
      group: ["productName"],
    });

    const count = await Variant.count({
      include: {
        model: Product,
        attributes: [],
        as: "product",
        where: { categoryId: 4 },
      },
      where: whereCondition,
      distinct: true,
      col: "productName",
    });

    res.json({
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

self.getStockByName = async (req, res, next) => {
  try {
    const { productName, name = "" } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const offset = (page - 1) * limit;

    if (!productName) {
      return res.json({
        success: true,
        message: "Data found",
        data: [],
        totalData: 1,
        totalPages: 1,
        currentPage: 1,
      });
    }

    const { count, rows } = await Variant.findAndCountAll({
      attributes: ["productName", "name", "stock"],
      where: {
        [Op.and]: [
          where(
            fn("REPLACE", col("productName"), " ", ""),
            Op.eq,
            productName.replaceAll(" ", "")
          ),
          { name: { [Op.like]: `%${name.replace(/\s/g, "+")}%` } },
        ],
      },
      limit,
      offset,
      order: [["name", "ASC"]],
    });

    res.json({
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

module.exports = self;
