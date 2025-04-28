"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class warranty extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      warranty.belongsTo(models.optic, {
        as: "optic",
        foreignKey: "opticId",
      });
      warranty.hasMany(models.warrantyclaim, {
        as: "warrantyclaim",
        foreignKey: "warrantyId",
      });
    }
  }
  warranty.init(
    {
      name: DataTypes.STRING,
      frame: DataTypes.STRING,
      lens: DataTypes.STRING,
      od: DataTypes.STRING,
      os: DataTypes.STRING,
      warranty_frame: DataTypes.STRING,
      warranty_lens: DataTypes.STRING,
      expire_frame: DataTypes.DATE,
      expire_lens: DataTypes.DATE,
      opticId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "warranty",
      tableName: "warranties",
    }
  );
  return warranty;
};
