const { where } = require("sequelize");
const { medicalrecord, optic, patient, Sequelize } = require("../models");
const Op = Sequelize.Op;
const fs = require("fs");

let self = {};

self.create = async (req, res, next) => {
  try {
    const records = JSON.parse(req.body.records);
    if (!records || !Array.isArray(records)) {
      return res.status(400).json({
        success: false,
        message: "Medical records data must be an array",
      });
    }

    // Bulk Insert
    const insertedRecords = await medicalrecord.bulkCreate(records);

    res.status(201).json({
      success: true,
      message: "Medical records have been successfully saved",
      records: insertedRecords,
    });
  } catch (error) {
    next(error);
  }
};

self.get = async (req, res, next) => {
  try {
    const { isDeleted } = req.query; // Ambil parameter dari query URL
    const paranoidValue = isDeleted === "true" ? false : true; // Default adalah true jika tidak ada parameter

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const offset = (page - 1) * limit;

    const { name, opticId, startDate, endDate } = req.query;

    const whereCondition = {};
    const whereName = {};

    // Filter by name (search) jika diisi
    if (name) {
      whereName.name = { [Op.like]: `%${name}%` };
    }

    // Filter by opticId jika diisi
    if (opticId) {
      whereCondition.opticId = opticId;
    }

    if (isDeleted) {
      whereCondition.deletedAt = { [Op.ne]: null };
      whereName.deletedAt = null;
    }

    // Filter date range berdasarkan createdAt dari tabel patient
    if (startDate && endDate) {
      whereCondition.visit_date = {
        [Op.or]: [{ [Op.between]: [startDate, endDate] }, { [Op.is]: null }],
      };
      whereCondition.createdAt = {
        [Op.between]: [startDate, endDate],
      };
    } else if (startDate) {
      whereCondition.visit_date = {
        [Op.or]: [{ [Op.gte]: startDate }, { [Op.is]: null }],
      };
      whereCondition.createdAt = { [Op.gte]: startDate };
    } else if (endDate) {
      whereCondition.visit_date = {
        [Op.or]: [{ [Op.lte]: endDate }, { [Op.is]: null }],
      };
      whereCondition.createdAt = { [Op.lte]: endDate };
    }

    // Query untuk mendapatkan data pasien dengan pagination
    const { count, rows } = await medicalrecord.findAndCountAll({
      include: [
        {
          model: patient,
          as: "patient",
          attributes: ["name"],
          where: whereName,
          paranoid: paranoidValue,
        },
        {
          model: optic,
          as: "optic",
          attributes: ["optic_name"],
          paranoid: paranoidValue,
        },
      ],
      where: whereCondition,
      paranoid: paranoidValue,
      limit,
      offset,
      order: [["id", "DESC"]], // Urutkan berdasarkan createdAt terbaru
      logging: console.log,
    });

    res.status(200).json({
      success: true,
      message: "Data Medical Record found",
      data: rows,
      totalData: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    next(error);
  }
};

self.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { force } = req.query;

    // Check Record
    const checkRecord = await medicalrecord.findByPk(id, { paranoid: false });
    if (!checkRecord) {
      return res.status(400).json({
        success: false,
        message: "Medical record not found!",
      });
    }

    if (force === "true") {
      if (checkRecord.image) {
        const filePath = `./uploads/${checkRecord.image}`;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath); //Delete if file exists
        }
      }
    }

    // Delete medicalrecord
    await checkRecord.destroy({ force: force === "true" });
    res.status(200).json({
      success: true,
      message:
        force === "true" ? "Data is permanently deleted!" : "Move to trash!",
    });
  } catch (error) {
    next(error);
  }
};

self.restore = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check Patient
    const checkRecord = await medicalrecord.findByPk(id, { paranoid: false });
    if (!checkRecord) {
      return res.status(400).json({
        success: false,
        message: "Medical record not found!",
      });
    }

    // Restore Record
    await checkRecord.restore();
    res.status(200).json({
      success: true,
      message: "Data successfully restored",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = self;
