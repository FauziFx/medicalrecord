const {
  Variant,
  Transaction,
  TransactionDetail,
  TransactionType,
  Customer,
  Sequelize,
  sequelize,
} = require("../models");

let self = {};

// self.get = async (req, res) => {
//   try {
//     const transactions = await Transaction.findAll({
//       include: [
//         { model: Customer, as: "customer" },
//         { model: TransactionType, as: "transactionType" },
//       ],
//       order: [["date", "DESC"]],
//     });
//     res.json(transactions);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to retrieve transactions." });
//   }
// };

// // GET /transactions/:id
// self.getById = async (req, res) => {
//   try {
//     const transaction = await Transaction.findByPk(req.params.id, {
//       include: [
//         { model: Customer, as: "customer" },
//         { model: TransactionType, as: "transactionType" },
//         { model: TransactionDetail, as: "details" },
//       ],
//     });

//     if (!transaction) {
//       return res.status(404).json({ message: "Transaction not found." });
//     }

//     res.json(transaction);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to get transaction." });
//   }
// };

// POST /transactions
self.create = async (req, res) => {
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
    console.error(err);
    res.status(500).json({ message: "Failed to create transaction." });
  }
};

const generateReceiptNo = () => {
  const shortTime = Date.now().toString().slice(-6); // 6 digit terakhir dari timestamp
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase(); // 4 huruf
  return `TRX-${shortTime}${randomStr}`; // total: 4+1+6+4 = 15 karakter
};

module.exports = self;
