const {
  Variant,
  Transaction,
  TransactionDetail,
  TransactionType,
  Customer,
  Sequelize,
  sequelize,
} = require("../models");

const { Op, fn, col } = Sequelize;

let self = {};

self.get = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const offset = (page - 1) * limit;

    const { search, typeId, startDate, endDate, detail = false } = req.query;

    const where = {};

    if (search) {
      where.receipt_no = { [Op.like]: `%${search}%` };
    }

    if (typeId) {
      where.transactionTypeId = typeId;
    }

    let includes = [
      { model: Customer, as: "customer" },
      { model: TransactionType, as: "transactionType" },
    ];
    if (detail) {
      includes.push({ model: TransactionDetail, as: "details" });
    }

    if (startDate && endDate) {
      where.date = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const { rows, count } = await Transaction.findAndCountAll({
      include: includes,
      where,
      distinct: true,
      order: [["date", "DESC"]],
      limit,
      offset,
    });

    res.status(200).json({
      success: true,
      data: rows,
      totalData: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(req.query.page) || 1,
    });
  } catch (err) {
    next(err);
  }
};

// GET /transactions/:id
self.getById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id, {
      include: [
        { model: Customer, as: "customer" },
        { model: TransactionType, as: "transactionType" },
        { model: TransactionDetail, as: "details" },
      ],
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found." });
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (err) {
    next(err);
  }
};

// POST /transactions
self.create = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    let {
      total_amount,
      payment_amount,
      change_amount,
      payment_method,
      include_revenue,
      customerId,
      transactionTypeId,
      transactionDetails,
    } = req.body;

    if (!customerId) {
      const defaultCustomer = await Customer.findOne({
        where: { is_default: 1 },
      });

      customerId = defaultCustomer.id;
      include_revenue = defaultCustomer.include_revenue;
      transactionTypeId = defaultCustomer.transactionTypeId;
    }

    const transaction = await Transaction.create(
      {
        receipt_no: generateReceiptNo(),
        total_amount,
        payment_amount,
        change_amount,
        payment_method,
        include_revenue,
        customerId,
        transactionTypeId,
      },
      { transaction: t }
    );

    await Promise.all(
      transactionDetails.map(async (item) => {
        await TransactionDetail.create(
          {
            productId: item.productId,
            productName: item.productName,
            variantId: item.variantId,
            variantName: item.variantName,
            price: Number(item.price),
            qty: Number(item.qty),
            subtotal: item.subtotal,
            transactionId: transaction.id,
          },
          { transaction: t }
        );

        await Variant.decrement("stock", {
          by: item.qty,
          where: { id: item.variantId },
          transaction: t,
        });
      })
    );

    await t.commit();
    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      receipt: transaction.receipt_no,
    });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

const generateReceiptNo = () => {
  const shortTime = Date.now().toString().slice(-6); // 6 digit terakhir dari timestamp
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase(); // 4 huruf
  return `TRX-${shortTime}${randomStr}`; // total: 4+1+6+4 = 15 karakter
};

module.exports = self;
