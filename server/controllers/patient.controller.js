const {
  patient,
  medicalcondition,
  patientcondition,
  medicalrecord,
  optic,
  Sequelize,
} = require("../models");
const fs = require("fs");
const Op = Sequelize.Op;

let self = {};

self.create = async (req, res, next) => {
  try {
    const {
      name,
      address,
      phone_number,
      place_of_birth,
      date_of_birth,
      occupation,
      gender,
      conditions,
      opticId,
    } = req.body;

    // Simpan data Patient
    const createPatient = await patient.create({
      name,
      address,
      phone_number,
      place_of_birth,
      date_of_birth,
      occupation,
      gender,
      opticId,
    });

    // Jika ada data kondisi medis, langsung simpan
    if (conditions && conditions.length > 0) {
      for (const conditionName of conditions) {
        // Gunakan findOrCreate untuk menghindari duplikasi kondisi medis
        const [condition] = await medicalcondition.findOrCreate({
          where: { name: conditionName },
        });

        // Hubungkan dengan pasien
        await patientcondition.create({
          patientId: createPatient.id,
          conditionId: condition.id,
        });
      }
    }

    res.status(201).json({
      success: true,
      message: "Patient and medical condition successfully added",
      patientId: createPatient.id,
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

    if (isDeleted) {
      whereCondition.deletedAt = { [Op.ne]: null };
    }

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
    const { count, rows } = await patient.findAndCountAll({
      include: [
        {
          model: medicalcondition,
          through: { attributes: [] }, // Hilangkan data dari tabel relasi
          attributes: ["id", "name"], // Ambil hanya id dan nama kondisi medis
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
      order: [["id", "DESC"]], // Urutkan berdasarkan id terbaru
    });

    res.status(200).json({
      success: true,
      message: "Data Patient found",
      data: rows,
      totalData: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    next(error);
  }
};
self.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { detail } = req.query;

    let include = [
      {
        model: medicalcondition,
        through: { attributes: [] }, // Hilangkan data dari tabel relasi
        attributes: ["name"], // Ambil hanya id dan nama kondisi medis
      },
      {
        model: optic,
        as: "optic",
        attributes: ["optic_name"],
      },
    ];
    if (detail === "full") {
      include.push({
        model: medicalrecord,
        as: "medicalRecord",
        order: [["visit_date", "DESC"]],
        include: [
          {
            model: optic,
            as: "optic",
            attributes: ["optic_name"],
          },
        ],
      });
    }

    const patients = await patient.findOne({
      where: {
        id: id,
      },
      include: include,
    });

    if (patients) {
      res.status(200).json({
        success: true,
        message: "Data Patient found",
        data: patients,
      });
    } else {
      res.status(200).json({
        success: false,
        message: "Data Patient not found",
        data: null,
      });
    }
  } catch (error) {
    next(error);
  }
};

self.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      address,
      phone_number,
      place_of_birth,
      date_of_birth,
      occupation,
      gender,
      conditions,
      opticId,
    } = req.body;

    // Check Patient
    const checkPatient = await patient.findByPk(id);
    if (!checkPatient) {
      return res.status(400).json({
        success: false,
        message: "Patient not found!",
      });
    }

    // Update Patient
    await checkPatient.update({
      name,
      address,
      phone_number,
      place_of_birth,
      date_of_birth,
      occupation,
      gender,
      opticId,
    });

    // Check Patient Condition
    if (conditions && Array.isArray(conditions)) {
      // Delete old condition
      await patientcondition.destroy({ where: { patientId: id } });

      if (conditions.length > 0) {
        // Get Condition by condition name input
        const medicalCondition = await medicalcondition.findAll({
          where: { name: conditions },
        });

        // Create new Condition
        const newCondition = medicalCondition.map((cond) => ({
          patientId: id,
          conditionId: cond.id,
        }));

        await patientcondition.bulkCreate(newCondition);
      }
    }

    res.status(200).json({
      success: true,
      message: "Patient data updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

self.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { force } = req.query;

    // Check Patient
    const checkPatient = await patient.findByPk(id, { paranoid: false });
    if (!checkPatient) {
      return res.status(400).json({
        success: false,
        message: "Patient not found!",
      });
    }

    if (force === "true") {
      // Get medical record relation
      const medicalRecord = await medicalrecord.findAll({
        where: {
          patientId: id,
          image: {
            [Sequelize.Op.ne]: null,
          },
        },
      });
      // Delete image from storage
      medicalRecord.forEach((record) => {
        if (record.image) {
          const filePath = `./uploads/${record.image}`;
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath); //Delete if file exists
          }
        }
      });
    }

    // Deleted medicalrecord, patientcondition, patient
    await medicalrecord.destroy({
      where: { patientId: id },
      force: force === "true",
    });
    await patientcondition.destroy({
      where: { patientId: id },
      force: force === "true",
    });
    await checkPatient.destroy({ force: force === "true" });
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
    const checkPatient = await patient.findByPk(id, { paranoid: false });
    if (!checkPatient) {
      return res.status(400).json({
        success: false,
        message: "Patient not found!",
      });
    }

    // Restore medicalrecord, patientcondition, patient
    await medicalrecord.restore({
      where: { patientId: id },
    });
    await patientcondition.restore({
      where: { patientId: id },
    });
    await checkPatient.restore();
    res.status(200).json({
      success: true,
      message: "Data successfully restored",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = self;
