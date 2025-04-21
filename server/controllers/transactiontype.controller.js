const { TransactionType, Customer, Sequelize } = require("../models");

let self = {};

// GET all transaction types
self.get = async (req, res, next) => {
  try {
    const data = await TransactionType.findAll();
    res.status(200).json({
      success: true,
      message: "Transaction types fetched successfully",
      data: data,
    });
  } catch (error) {
    next(error);
  }
};

// GET transaction type by ID
self.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const type = await TransactionType.findByPk(id);
    if (!type)
      return res
        .status(404)
        .json({ success: false, message: "Transaction type not found" });

    res.status(200).json({
      success: true,
      message: "Transaction type fetched successfully",
      data: type,
    });
  } catch (error) {
    next(error);
  }
};

// CREATE transaction type
self.create = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const newType = await TransactionType.create({ name, description });
    res.status(201).json({
      success: true,
      message: "Transaction type created successfully",
      data: newType,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE transaction type
self.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const type = await TransactionType.findByPk(id);
    if (!type)
      return res
        .status(404)
        .json({ success: false, message: "Transaction type not found" });

    await type.update({ name, description });
    res.status(200).json({
      success: true,
      message: "Transaction type updated successfully",
      data: type,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE transaction type
self.delete = async (req, res, next) => {
  try {
    const { id } = req.params;

    const type = await TransactionType.findByPk(id);
    if (!type)
      return res
        .status(404)
        .json({ success: false, message: "Transaction type not found" });

    const relatedCustomers = await Customer.count({
      where: { transactionTypeId: id },
    });
    if (relatedCustomers > 0) {
      return res.json({
        success: false,
        message:
          "Cannot delete. There are customers using this transaction type.",
      });
    }

    await type.destroy();
    res.status(200).json({
      success: true,
      message: "Transaction type deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = self;
