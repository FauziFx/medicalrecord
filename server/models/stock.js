"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Stock extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Stock.belongsTo(models.Product, {
        foreignKey: "productId",
        as: "product",
      });
      Stock.belongsTo(models.Variant, {
        foreignKey: "variantId",
        as: "variant",
      });
    }
  }
  Stock.init(
    {
      productId: DataTypes.INTEGER,
      productName: DataTypes.STRING,
      variantId: DataTypes.INTEGER,
      variantName: DataTypes.STRING,
      type: DataTypes.ENUM("in", "out", "adjust"),
      before_stock: DataTypes.INTEGER,
      adjust: DataTypes.INTEGER,
      after_stock: DataTypes.INTEGER,
      note: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Stock",
      tableName: "stocks",
    }
  );
  return Stock;
};
