const { Product, Category, Variant, Sequelize } = require("../models");
const Op = Sequelize.Op;

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

self.create = async (req, res, next) => {
  try {
    const { name, categoryId, status, description, base_price, variants } =
      req.body;

    // 1. Simpan product dulu
    const newProduct = await Product.create({
      name,
      categoryId,
      description,
      status,
      base_price,
    });

    // 2. Siapkan variants dengan SKU
    const variantsWithSku = variants.map((v, index) => ({
      ...v,
      productId: newProduct.id,
      sku: generateSku(categoryId, newProduct.id, index),
    }));

    // 3. Simpan semua variants
    await Variant.bulkCreate(variantsWithSku);

    res.status(201).json({
      success: true,
      message: "Product & variants Created",
      data: newProduct,
    });
  } catch (error) {
    next(error);
  }
};

self.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const response = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          attributes: ["name"],
          as: "categories",
        },
        {
          model: Variant,
          as: "variants",
        },
      ],
    });

    if (!response) {
      return res.status(400).json({
        success: false,
        message: "User not found!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Data found",
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

const generateSku = (categoryId, productId, index) => {
  const categoryCode = String(categoryId).padStart(2, "0");
  const productCode = String(productId).padStart(3, "0");
  const indexCode = String(index).padStart(3, "0");

  return `SKU-CAT${categoryCode}-${productCode + indexCode}`;
};

module.exports = self;
