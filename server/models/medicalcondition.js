"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class medicalcondition extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      medicalcondition.belongsToMany(models.patient, {
        through: models.patientcondition,
        foreignKey: "conditionId",
      });
    }
  }
  medicalcondition.init(
    {
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "medicalcondition",
    }
  );
  return medicalcondition;
};
