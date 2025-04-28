"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Customer.belongsTo(models.TransactionType, {
        foreignKey: "transactionTypeId",
        as: "transactionType",
      });

      Customer.hasMany(models.Transaction, {
        foreignKey: "customerId",
        as: "transactions",
      });
    }
  }
  Customer.init(
    {
      name: DataTypes.STRING,
      transactionTypeId: DataTypes.INTEGER,
      include_revenue: DataTypes.INTEGER,
      is_default: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Customer",
      tableName: "customers",
    }
  );
  return Customer;
};
