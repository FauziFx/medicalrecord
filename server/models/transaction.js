"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Transaction.belongsTo(models.Customer, {
        foreignKey: "customerId",
        as: "customer",
      });

      Transaction.belongsTo(models.TransactionType, {
        foreignKey: "transactionTypeId",
        as: "transactionType",
      });

      Transaction.hasMany(models.TransactionDetail, {
        foreignKey: "transactionId",
        as: "details",
      });
    }
  }
  Transaction.init(
    {
      receipt_no: DataTypes.STRING,
      date: DataTypes.DATE,
      total_amount: DataTypes.INTEGER,
      payment_amount: DataTypes.INTEGER,
      change_amount: DataTypes.INTEGER,
      payment_method: DataTypes.STRING,
      include_revenue: DataTypes.INTEGER,
      customerId: DataTypes.INTEGER,
      transactionTypeId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Transaction",
      tableName: "transactions",
    }
  );
  return Transaction;
};
