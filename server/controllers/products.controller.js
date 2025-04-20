const { Product, Category, Variant, Sequelize } = require("../models");
const Op = Sequelize.Op;

let self = {};

self.get = async (req, res, next) => {
  try {
    const { name, categoryId, status, all } = req.query;

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

    let limit, offset;
    const isAll = all === "true" || all === true;

    if (!isAll) {
      const page = parseInt(req.query.page) || 1;
      limit = parseInt(req.query.limit) || 15;
      offset = (page - 1) * limit;
    }

    const { count, rows } = await Product.findAndCountAll({
      attributes: isAll
        ? ["id", "name"]
        : [
            "id",
            "name",
            "base_price",
            "description",
            "categoryId",
            "status",
            "createdAt",
            "updatedAt",
          ],
      include: isAll
        ? []
        : [
            {
              model: Category,
              attributes: ["name"],
              as: "categories",
            },
          ],
      where: whereCondition,
      ...(isAll ? {} : { limit, offset }),
    });

    res.status(200).json({
      success: true,
      message: "Data Product found",
      data: rows,
      totalData: count,
      totalPages: isAll ? 1 : Math.ceil(count / limit),
      currentPage: isAll ? 1 : parseInt(req.query.page) || 1,
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
    const { adjustment = false } = req.query;

    const whereVariant = {};
    if (adjustment) {
      whereVariant.track_stock = 1;
    }

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
          where: whereVariant,
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

self.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Check User
    const checkUser = await Product.findByPk(id);
    if (!checkUser) {
      return res.status(400).json({
        success: false,
        message: "User not found!",
      });
    }

    // Update User
    await checkUser.update({
      status,
    });

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

self.update = async (req, res, next) => {
  const { id } = req.params;
  const {
    name,
    categoryId,
    status,
    description,
    base_price,
    updatedVariants,
    newVariants,
    deletedVariantIds,
  } = req.body;

  try {
    // 1. Update product data
    await Product.update(
      { name, categoryId, status, description, base_price },
      { where: { id } }
    );

    // 2. Delete variants that were removed
    if (deletedVariantIds?.length) {
      await Variant.destroy({
        where: { id: deletedVariantIds, productId: id },
      });
    }

    // 3. Update existing variants
    for (const variant of updatedVariants) {
      const { id: variantId, ...rest } = variant;
      await Variant.update(rest, { where: { id: variantId, productId: id } });
    }

    // 4. Ambil semua SKU yang masih ada setelah update & delete
    const existingVariants = await Variant.findAll({
      where: { productId: id },
      attributes: ["sku"],
    });

    // 5. Cari last index dari SKU lama
    const lastSkuIndex = existingVariants.length
      ? Math.max(
          ...existingVariants.map((v) => parseInt(v.sku?.slice(-3)) || 0)
        )
      : 0;

    // 6. Generate SKU & buat variant baru
    const variantsToCreate = newVariants.map((v, i) => ({
      ...v,
      productId: id,
      sku: generateSku(categoryId, id, lastSkuIndex + i + 1),
    }));

    // 7. Bulk create new variants
    if (variantsToCreate.length) {
      await Variant.bulkCreate(variantsToCreate);
    }

    return res
      .status(200)
      .json({ success: true, message: "Product updated successfully" });
  } catch (error) {
    next(error);
  }
};

self.delete = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check Product
    const checkProduct = await Product.findByPk(id);
    if (!checkProduct) {
      return res.status(400).json({
        success: false,
        message: "Product not found!",
      });
    }

    await Variant.destroy({
      where: { productId: id },
    });
    await checkProduct.destroy();
    res.status(200).json({
      success: true,
      message: "Product Deleted!",
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
