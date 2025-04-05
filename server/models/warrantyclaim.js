"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class warrantyclaim extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      warrantyclaim.belongsTo(models.warranty, {
        as: "warranty",
        foreignKey: "warrantyId",
      });
    }
  }
  warrantyclaim.init(
    {
      warrantyId: DataTypes.INTEGER,
      warranty_type: DataTypes.STRING,
      damage: DataTypes.STRING,
      repair: DataTypes.STRING,
      claim_date: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "warrantyclaim",
    }
  );
  return warrantyclaim;
};
