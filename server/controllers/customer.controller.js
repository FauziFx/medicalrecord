const { Customer, TransactionType, Sequelize } = require("../models");
const { Op } = Sequelize;

let self = {};

// Get all customers with optional search by name
self.get = async (req, res, next) => {
  try {
    const { name } = req.query;

    const whereClause = {};
    if (name) {
      whereClause.name = {
        [Op.like]: `%${name}%`,
      };
    }

    const customers = await Customer.findAll({
      where: whereClause,
      include: [{ model: TransactionType, as: "transactionType" }],
      order: [["name", "ASC"]],
    });

    res.status(200).json({
      success: true,
      data: customers,
      message: "Customers fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};
// Get customer by ID
self.getById = async (req, res, next) => {
  try {
    const { id } = req.params.id;
    const customer = await Customer.findByPk(id, {
      include: [{ model: TransactionType, as: "transactionType" }],
    });
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }
    res.json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};
// Create new customer
self.create = async (req, res, next) => {
  try {
    const {
      name,
      transactionTypeId,
      include_revenue = 1,
      is_default = 0,
    } = req.body;

    if (parseInt(is_default) === 1) {
      await Customer.update({ is_default: 0 }, { where: { is_default: 1 } });
    }

    const newCustomer = await Customer.create({
      name,
      transactionTypeId,
      include_revenue: parseInt(include_revenue),
      is_default: parseInt(is_default),
    });

    res
      .status(201)
      .json({ success: true, message: "Customer created", data: newCustomer });
  } catch (error) {
    next(error);
  }
};
// Update customer
self.update = async (req, res, next) => {
  try {
    const {
      name,
      transactionTypeId,
      include_revenue = 1,
      is_default = 0,
    } = req.body;

    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    if (parseInt(is_default) === 1) {
      await Customer.update({ is_default: 0 }, { where: { is_default: 1 } });
    }

    await customer.update({
      name,
      transactionTypeId,
      include_revenue: parseInt(include_revenue),
      is_default: parseInt(is_default),
    });

    res.json({ success: true, message: "Customer updated", data: customer });
  } catch (error) {
    next(error);
  }
};
// Delete customer
self.delete = async (req, res, next) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    await customer.destroy();
    res.json({ success: true, message: "Customer deleted" });
  } catch (error) {
    next(error);
  }
};
module.exports = self;
