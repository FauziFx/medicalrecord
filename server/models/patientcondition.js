"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class patientcondition extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      patientcondition.belongsTo(models.patient, { foreignKey: "patientId" });
      patientcondition.belongsTo(models.medicalcondition, {
        foreignKey: "conditionId",
      });
    }
  }
  patientcondition.init(
    {
      patientId: DataTypes.INTEGER,
      conditionId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "patientcondition",
      paranoid: true,
      timestamps: true,
      tableName: "patientconditions",
    }
  );
  return patientcondition;
};
