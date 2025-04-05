"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class patient extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      patient.belongsTo(models.optic, {
        as: "optic",
        foreignKey: "opticId",
      });

      patient.belongsToMany(models.medicalcondition, {
        through: models.patientcondition,
        foreignKey: "patientId",
      });

      patient.hasMany(models.medicalrecord, {
        as: "medicalRecord",
        foreignKey: "patientId",
      });
    }
  }
  patient.init(
    {
      name: DataTypes.STRING,
      address: DataTypes.STRING,
      phone_number: DataTypes.STRING,
      place_of_birth: DataTypes.STRING,
      date_of_birth: DataTypes.DATE,
      occupation: DataTypes.STRING,
      gender: DataTypes.STRING,
      medical_history: DataTypes.STRING,
      opticId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "patient",
      paranoid: true,
      timestamps: true,
    }
  );
  return patient;
};
