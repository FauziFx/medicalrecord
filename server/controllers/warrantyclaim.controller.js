const { warrantyclaim, warranty, optic, Sequelize } = require("../models");
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
    const whereWarranty = {};

    // Filter by name (search) jika diisi
    if (name) {
      whereWarranty.name = { [Op.like]: `%${name}%` };
    }

    // Filter by warranty type jika diisi
    if (opticId) {
      whereWarranty.opticId = opticId;
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
    const { count, rows } = await warrantyclaim.findAndCountAll({
      include: [
        {
          model: warranty,
          as: "warranty",
          where: whereWarranty,
          attributes: ["name"],
          include: [{ model: optic, as: "optic", attributes: ["optic_name"] }],
        },
      ],
      where: whereCondition,
      limit,
      offset,
      order: [["id", "DESC"]], // Urutkan berdasarkan id terbaru
    });

    res.status(200).json({
      success: true,
      message: "Data Warranty Claim found",
      data: rows,
      totalData: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    next(error);
  }
};

// Create warranty
self.create = async (req, res, next) => {
  const { warrantyId, warranty_type, damage, repair, claim_date } = req.body;
  try {
    const response = await warrantyclaim.create(
      {
        warrantyId,
        warranty_type,
        damage,
        repair,
        claim_date,
      },
      {
        individualHooks: true,
      }
    );
    res.status(201).json({
      success: true,
      message: `Warranty claim has been Submitted successfully`,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

// Delete
self.delete = async (req, res, next) => {
  const { id } = req.params;
  try {
    const response = await warrantyclaim.findByPk(id);
    if (response) {
      await response.destroy();
      res.status(200).json({
        success: true,
        message: "Warranty claim deleted",
      });
    } else {
      res.json({ success: false, message: "Warranty claim not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = self;
