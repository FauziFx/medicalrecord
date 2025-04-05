const { optic, user, patient, medicalrecord, Sequelize } = require("../models");
const Op = Sequelize.Op;

let self = {};

// Get ALl
self.get = async (req, res, next) => {
  try {
    const { status } = req.query;
    let whereCondition = {};

    if (status === "inactive") {
      whereCondition.status = 0;
    } else if (status === "active") {
      whereCondition.status = 1;
    }
    const response = await optic.findAll({
      where: whereCondition,
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

// Get By Id
self.getById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const response = await optic.findByPk(id);
    res.status(200).json({
      success: true,
      message: "Data found",
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

// Create optic
self.create = async (req, res, next) => {
  const { optic_name } = req.body;
  try {
    const response = await optic.create({
      optic_name,
    });
    res.status(201).json({
      success: true,
      message: `Optic ${optic_name} has been Submitted successfully`,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

// Update
self.update = async (req, res, next) => {
  const { optic_name, status } = req.body;
  const { id } = req.params;
  try {
    const response = await optic.findByPk(id);
    if (response) {
      response.optic_name = optic_name;
      response.status = status;
      await response.save();
      res.status(201).json({
        success: true,
        message: "Update successfully",
        data: response,
      });
    } else {
      res.json({
        success: false,
        message: "Optic not found",
      });
    }
  } catch (error) {
    next(error);
  }
};

// Delete
self.delete = async (req, res, next) => {
  const { id } = req.params;
  try {
    // Check for relations with MedicalRecord
    const associatedMedicalRecords = await medicalrecord.findAll({
      where: { opticId: id },
    });

    // Check for relations with Patient
    const associatedPatients = await patient.findAll({
      where: { opticId: id },
    });

    // Check for relations with User
    const associatedUsers = await user.findAll({ where: { opticId: id } });

    if (
      associatedMedicalRecords.length > 0 ||
      associatedPatients.length > 0 ||
      associatedUsers.length > 0
    ) {
      return res.json({
        success: false,
        message: "Optic cannot be deleted because it has relationships",
      });
    }

    const response = await optic.findByPk(id);
    if (response) {
      await response.destroy({ force: true });
      res.status(200).json({
        success: true,
        message: "Optic deleted",
      });
    } else {
      res.json({ success: false, message: "Optic not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = self;
