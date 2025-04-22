"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Variant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Variant.belongsTo(models.Product, {
        foreignKey: "productId",
        as: "product",
      });

      Variant.hasMany(models.Stock, {
        foreignKey: "variantId",
        as: "StockAdjustments",
      });

      Variant.hasMany(models.TransactionDetail, {
        foreignKey: "variantId",
        as: "transactionDetails",
      });
    }
  }
  Variant.init(
    {
      sku: DataTypes.STRING,
      name: DataTypes.STRING,
      stock: DataTypes.INTEGER,
      minimum_stock: DataTypes.INTEGER,
      price: DataTypes.INTEGER,
      track_stock: DataTypes.INTEGER,
      productId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Variant",
    }
  );
  return Variant;
};
