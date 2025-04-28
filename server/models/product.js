"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Product.belongsTo(models.Category, {
        foreignKey: "categoryId",
        as: "categories",
      });

      Product.hasMany(models.Variant, {
        foreignKey: "productId",
        as: "variants",
      });

      Product.hasMany(models.Stock, {
        foreignKey: "productId",
        as: "StockAdjustments",
      });

      Product.hasMany(models.TransactionDetail, {
        foreignKey: "productId",
        as: "transactionDetails",
      });
    }
  }
  Product.init(
    {
      name: DataTypes.STRING,
      base_price: DataTypes.INTEGER,
      description: DataTypes.STRING,
      categoryId: DataTypes.INTEGER,
      status: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Product",
      tableName: "products",
    }
  );
  return Product;
};
