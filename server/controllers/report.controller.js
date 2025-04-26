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

self.getTransactionTrend = async (req, res, next) => {
  try {
    const { range } = req.query; // 7 atau 30
    const days = range === "30" ? 29 : 6;
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - days);

    // Generate daftar semua tanggal dalam range (supaya tidak bolong-bolong)
    // const labels = [];
    // for (let d = new Date(pastDate); d <= today; d.setDate(d.getDate() + 1)) {
    //   labels.push(d.toISOString().slice(0, 10)); // format YYYY-MM-DD
    // }

    const dateLabels = [];
    for (let d = new Date(pastDate); d <= today; d.setDate(d.getDate() + 1)) {
      const yearMonthDay = d.toISOString().slice(0, 10); // "2025-04-20"
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");

      dateLabels.push({
        full: yearMonthDay,
        short: `${month}-${day}`,
      });
    }

    // Lalu bikin label
    const labels = dateLabels.map((dl) => dl.short);

    const transactions = await Transaction.findAll({
      where: {
        date: {
          [Op.between]: [pastDate, today],
        },
        include_revenue: 1, // optional kalau mau
      },
      include: [
        {
          model: TransactionType,
          attributes: ["id", "name"],
          as: "transactionType",
        },
      ],
      attributes: ["total_amount", "date", "transactionTypeId"],
    });

    // Group data
    const grouped = {};

    transactions.forEach((tx) => {
      const typeName = tx.transactionType.name;
      const dateKey = tx.date.toISOString().slice(0, 10);

      if (!grouped[typeName]) {
        grouped[typeName] = {};
      }

      if (!grouped[typeName][dateKey]) {
        grouped[typeName][dateKey] = 0;
      }

      grouped[typeName][dateKey] += tx.total_amount;
    });

    // Bikin series sesuai format apexchart
    const series = Object.keys(grouped).map((typeName) => ({
      name: typeName,
      data: dateLabels.map((dl) => grouped[typeName][dl.full] || 0),
    }));
    return res.status(200).json({ success: true, data: { labels, series } });
  } catch (error) {
    next(error);
  }
};

self.getTopSellingProducts = async (req, res, next) => {
  try {
    const { range } = req.query; // ambil query param, misal ?range=7 atau ?range=30

    const days = range === "30" ? 29 : 6; // default ke 7 kalau tidak diisi
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - (days - 1));

    // Cari data TransactionDetail yang join ke Transaction untuk filter tanggal
    const topProducts = await TransactionDetail.findAll({
      attributes: [
        "productName",
        [Sequelize.fn("SUM", Sequelize.col("qty")), "totalQty"],
      ],
      include: [
        {
          model: Transaction,
          attributes: [], // tidak perlu ambil field apa-apa
          as: "transaction",
          where: {
            createdAt: {
              [Op.between]: [pastDate, today],
            },
          },
        },
      ],
      group: ["productName"],
      order: [[Sequelize.literal("totalQty"), "DESC"]],
      limit: 10,
      raw: true,
    });

    const labels = topProducts.map((p) => p.productName);
    const series = topProducts.map((p) => parseInt(p.totalQty)); // pastikan integer
    return res.status(200).json({
      success: true,
      data: {
        labels,
        series,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = self;
