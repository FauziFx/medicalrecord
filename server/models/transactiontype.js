"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TransactionType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      TransactionType.hasMany(models.Customer, {
        foreignKey: "transactionTypeId",
        as: "customers",
      });

      TransactionType.hasMany(models.Transaction, {
        foreignKey: "transactionTypeId",
        as: "transactions",
      });
    }
  }
  TransactionType.init(
    {
      name: DataTypes.STRING,
      description: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "TransactionType",
    }
  );
  return TransactionType;
};
