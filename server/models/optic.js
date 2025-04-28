"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class optic extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      optic.hasMany(models.user, {
        as: "user",
        foreignKey: "opticId",
      });
      optic.hasMany(models.patient, {
        as: "patient",
        foreignKey: "opticId",
      });
      optic.hasMany(models.medicalrecord, {
        as: "medicalrecord",
        foreignKey: "opticId",
      });
      optic.hasMany(models.warranty, {
        as: "warranty",
        foreignKey: "opticId",
      });
    }
  }
  optic.init(
    {
      optic_name: DataTypes.STRING,
      status: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "optic",
      paranoid: true,
      timestamps: true,
      tableName: "optics",
    }
  );
  return optic;
};
