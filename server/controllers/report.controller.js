const { where } = require("sequelize");
const {
  Transaction,
  TransactionDetail,
  TransactionType,
  Customer,
  Sequelize,
} = require("../models");
const fs = require("fs");
const Op = Sequelize.Op;
const fn = Sequelize.fn;
const col = Sequelize.col;

let self = {};

self.getDailyReport = async (req, res, next) => {
  try {
    const { date: queryDate } = req.query;
    const date = queryDate || new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    // Transaction by paymetn method
    const response = await Transaction.findAll({
      attributes: [
        "transactionTypeId",
        "payment_method",
        [fn("SUM", col("total_amount")), "total"],
      ],
      where: where(fn("DATE", col("date")), "=", date),
      include: {
        model: TransactionType,
        attributes: ["id", "name"],
        as: "transactionType",
      },
      group: ["transactionTypeId", "TransactionType.id", "payment_method"],
      order: [
        ["transactionTypeId", "ASC"],
        ["payment_method", "ASC"],
      ],
    });

    const grouped = {};

    // group by transaction type
    response.forEach((item) => {
      const typeId = item.transactionTypeId;
      const typeName = item.transactionType.name;

      if (!grouped[typeId]) {
        grouped[typeId] = {
          transactionTypeId: typeId,
          transactionTypeName: typeName,
          payments: [],
        };
      }

      grouped[typeId].payments.push({
        payment_method: item.payment_method,
        total: Number(item.dataValues.total),
      });
    });

    const finalResult = Object.values(grouped);

    // Transaction Detail
    const details = await TransactionDetail.findAll({
      attributes: [
        "productName",
        "variantName",
        [fn("SUM", col("qty")), "totalQty"],
      ],
      include: [
        {
          model: Transaction,
          attributes: [],
          where: where(fn("DATE", col("date")), "=", date),
          as: "transaction",
        },
      ],
      group: ["productName", "variantName"],
      order: [["productName", "ASC"]],
    });

    // Get total Cash from Default Customer for POS Daily Report Print
    const defaultCustomer = await Customer.findOne({
      where: { is_default: 1 },
    });
    const totalCash = await Transaction.sum("total_amount", {
      where: {
        [Op.and]: [
          where(fn("DATE", col("date")), "=", date),
          { payment_method: "cash" }, // Kondisi tambahan
          { customerId: defaultCustomer.id },
        ],
      },
    });

    res.status(200).json({
      success: true,
      message: "Data Report Daily found",
      data: {
        transaction: finalResult,
        transactionDetails: details,
        totalCash: totalCash,
      },
    });
  } catch (error) {
    next(error);
  }
};

self.getSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const total = await Transaction.findAll({
      attributes: ["id", "total_amount"],
      where: {
        [Op.and]: [
          {
            date: {
              [Op.between]: [new Date(startDate), new Date(endDate)],
            },
          },
          {
            include_revenue: 1,
          },
        ],
      },
    });

    const totalRevenue = total.reduce(
      (accum, curr) => accum + curr.total_amount,
      0
    );
    const average = totalRevenue / total.length;

    const transactionId = total.map((item) => item.id);

    const totalItem = await TransactionDetail.sum("qty", {
      where: {
        transactionId: transactionId,
      },
    });

    const salesByTransactionType = await Transaction.findAll({
      attributes: [
        "transactionTypeId",
        [Sequelize.fn("SUM", Sequelize.col("total_amount")), "total_amount"],
      ],
      where: {
        date: {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        },
      },
      include: [
        {
          model: TransactionType,
          as: "transactionType",
          attributes: ["name"], // kalau kamu mau ambil nama transaksinya juga
        },
      ],
      group: ["transactionTypeId"],
    });

    const customerIncludeRevenue = await Transaction.findAll({
      attributes: [
        "customerId",
        [Sequelize.fn("SUM", Sequelize.col("total_amount")), "total_amount"],
      ],
      where: {
        date: {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        },
      },
      include: [
        {
          model: Customer,
          as: "customer",
          where: {
            include_revenue: true,
          },
          attributes: ["name"], // kalau mau tampilkan nama customer juga
        },
      ],
      group: ["customerId", "customer.id"],
    });

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: totalRevenue,
        average: average,
        totalTransaction: total.length,
        totalItemSold: totalItem,
        salesByTransactionType: salesByTransactionType,
        customerIncludeRevenue: customerIncludeRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};

self.getTopCustomer = async (req, res, next) => {
  try {
    const { typeId, startDate, endDate } = req.query;

    let where = {};
    if (typeId) {
      where.transactionTypeId = typeId;
    }

    const results = await Customer.findAll({
      attributes: [
        "id",
        "name",
        "include_revenue",
        [
          Sequelize.fn(
            "COALESCE",
            Sequelize.fn("SUM", Sequelize.col("transactions.total_amount")),
            0
          ),
          "total_amount",
        ],
      ],
      where: where,
      include: [
        {
          model: TransactionType,
          as: "transactionType",
          attributes: ["name"],
        },
        {
          model: Transaction,
          as: "transactions",
          attributes: [],
          where: {
            date: {
              [Op.between]: [new Date(startDate), new Date(endDate)],
            },
          },
          required: false, // biar customer tanpa transaksi tetap muncul
        },
      ],
      group: ["Customer.id"],
      order: [[Sequelize.literal("total_amount"), "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = self;
