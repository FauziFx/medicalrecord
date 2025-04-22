"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TransactionDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      TransactionDetail.belongsTo(models.Transaction, {
        foreignKey: "transactionId",
        as: "transaction",
      });

      TransactionDetail.belongsTo(models.Product, {
        foreignKey: "productId",
        as: "product",
      });

      TransactionDetail.belongsTo(models.Variant, {
        foreignKey: "variantId",
        as: "variant",
      });
    }
  }
  TransactionDetail.init(
    {
      productId: DataTypes.INTEGER,
      productName: DataTypes.STRING,
      variantId: DataTypes.INTEGER,
      variantName: DataTypes.STRING,
      price: DataTypes.INTEGER,
      qty: DataTypes.INTEGER,
      subtotal: DataTypes.INTEGER,
      transactionId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "TransactionDetail",
    }
  );
  return TransactionDetail;
};
