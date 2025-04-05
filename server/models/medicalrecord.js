"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class medicalrecord extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      medicalrecord.belongsTo(models.patient, {
        as: "patient",
        foreignKey: "patientId",
      });
      medicalrecord.belongsTo(models.optic, {
        as: "optic",
        foreignKey: "opticId",
      });
    }
  }
  medicalrecord.init(
    {
      od: DataTypes.STRING,
      os: DataTypes.STRING,
      far_pd: DataTypes.INTEGER,
      near_pd: DataTypes.INTEGER,
      visit_date: DataTypes.DATE,
      checked_by: DataTypes.STRING,
      note: DataTypes.STRING,
      image: DataTypes.STRING,
      is_olddata: DataTypes.INTEGER,
      patientId: DataTypes.INTEGER,
      opticId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "medicalrecord",
      paranoid: true,
      timestamps: true,
    }
  );
  return medicalrecord;
};
