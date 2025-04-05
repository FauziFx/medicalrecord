const { warranty, warrantyclaim, optic, Sequelize } = require("../models");
const Op = Sequelize.Op;

let self = {};

// Get ALl
self.get = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const offset = (page - 1) * limit;

    const { name, opticId, startDate, endDate } = req.query;

    const whereCondition = {};

    // Filter by name (search) jika diisi
    if (name) {
      whereCondition.name = { [Op.like]: `%${name}%` };
    }

    // Filter by opticId jika diisi
    if (opticId) {
      whereCondition.opticId = opticId;
    }

    // Filter date range berdasarkan createdAt dari tabel patient
    if (startDate && endDate) {
      whereCondition.createdAt = {
        [Op.between]: [startDate, endDate],
      };
    } else if (startDate) {
      whereCondition.createdAt = { [Op.gte]: startDate };
    } else if (endDate) {
      whereCondition.createdAt = { [Op.lte]: endDate };
    }

    // Query untuk mendapatkan data pasien dengan pagination
    const { count, rows } = await warranty.findAndCountAll({
      include: [
        {
          model: optic,
          as: "optic",
          attributes: ["optic_name"],
        },
      ],
      where: whereCondition,
      limit,
      offset,
      order: [["id", "DESC"]], // Urutkan berdasarkan id terbaru
    });

    res.status(200).json({
      success: true,
      message: "Data Warranty found",
      data: rows,
      totalData: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    next(error);
  }
};

// Get By Id
self.getById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const response = await warranty.findByPk(id, {
      include: [
        {
          model: optic,
          as: "optic",
          attributes: ["optic_name"],
        },
        {
          model: warrantyclaim,
          as: "warrantyclaim",
        },
      ],
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

// Create warranty
self.create = async (req, res, next) => {
  const {
    name,
    frame,
    lens,
    od,
    os,
    warranty_frame,
    warranty_lens,
    expire_frame,
    expire_lens,
    opticId,
    createdAt,
  } = req.body;
  try {
    const response = await warranty.create(
      {
        name,
        frame,
        lens,
        od,
        os,
        warranty_frame,
        warranty_lens,
        expire_frame,
        expire_lens,
        opticId,
        createdAt,
      },
      {
        individualHooks: true, // Menjalankan hooks (jika ada).
      }
    );
    res.status(201).json({
      success: true,
      message: `Warranty has been Submitted successfully`,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

// Update
self.update = async (req, res, next) => {
  const {
    name,
    frame,
    lens,
    od,
    os,
    warranty_frame,
    warranty_lens,
    expire_frame,
    expire_lens,
    opticId,
    createdAt,
  } = req.body;
  console.log({
    name,
    frame,
    lens,
    od,
    os,
    warranty_frame,
    warranty_lens,
    expire_frame,
    expire_lens,
    opticId,
    createdAt,
  });

  const { id } = req.params;
  try {
    const checkWarranty = await warranty.findByPk(id);
    if (!checkWarranty) {
      return res.json({
        success: false,
        message: "Warranty not found",
      });
    }

    await warranty.update(
      {
        name,
        frame,
        lens,
        od,
        os,
        warranty_frame,
        warranty_lens,
        expire_frame,
        expire_lens,
        opticId,
        createdAt,
      },
      {
        where: { id },
        individualHooks: true, // Menjalankan hooks (jika ada).
      }
    );
    return res.status(201).json({
      success: true,
      message: "Update successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Delete
self.delete = async (req, res, next) => {
  const { id } = req.params;
  try {
    const response = await warranty.findByPk(id);
    if (response) {
      await response.destroy();
      res.status(200).json({
        success: true,
        message: "Warranty deleted",
      });
    } else {
      res.json({ success: false, message: "Warranty not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = self;
