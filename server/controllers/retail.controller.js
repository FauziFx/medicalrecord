const { Retail, Sequelize } = require("./../models");
const { Op, fn, col } = Sequelize;

let self = {};

self.get = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const offset = (page - 1) * limit;

    const { name } = req.query;

    const whereCondition = {};

    // Filter by name (search) jika diisi
    if (name) {
      whereCondition.name = { [Op.like]: `%${name}%` };
    }

    // Query untuk mendapatkan data pasien dengan pagination
    const { count, rows } = await Retail.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      order: [["id", "DESC"]], // Urutkan berdasarkan id terbaru
    });

    res.status(200).json({
      success: true,
      message: "Data Warranty found",
      data: rows,
      totalData: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    next(error);
  }
};

self.getLastReceipt = async (req, res, next) => {
  try {
    // Cari nomor nota terbesar di tabel 'tbl_eceran'
    const lastReceipt = await Retail.findOne({
      attributes: [
        [fn("MAX", col("receipt_no")), "receipt_no"], // Menggunakan agregasi MAX
      ],
    });

    let receipt = parseInt(lastReceipt?.receipt_no || 0) + 1;
    let receipt_no = receipt.toString();
    let formattedNota = receipt_no.padStart(6, "0");

    res.status(200).json({
      success: true,
      data: formattedNota,
    });
  } catch (error) {
    next(error);
  }
};

self.create = async (req, res, next) => {
  const {
    date,
    receipt_no,
    name,
    address,
    phone,
    frame,
    lens,
    price,
    od,
    os,
    note,
  } = req.body;
  try {
    const response = await Retail.create({
      date,
      receipt_no,
      name,
      address,
      phone,
      frame,
      lens,
      price,
      od,
      os,
      note,
    });
    res.status(201).json({
      success: true,
      message: `Retail has been Submitted successfully`,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

self.update = async (req, res, next) => {
  const {
    date,
    receipt_no,
    name,
    address,
    phone,
    frame,
    lens,
    price,
    od,
    os,
    note,
  } = req.body;
  const { id } = req.params;
  try {
    const checkData = await Retail.findByPk(id);
    if (!checkData) {
      return res.json({
        success: false,
        message: "Data not found",
      });
    }

    await Retail.update(
      {
        date,
        receipt_no,
        name,
        address,
        phone,
        frame,
        lens,
        price,
        od,
        os,
        note,
      },
      {
        where: { id },
      }
    );
    return res.status(201).json({
      success: true,
      message: "Update successfully",
    });
  } catch (error) {
    next(error);
  }
};

self.delete = async (req, res, next) => {
  const { id } = req.params;
  try {
    const response = await Retail.findByPk(id);
    if (response) {
      await response.destroy();
      res.status(200).json({
        success: true,
        message: "Retail deleted",
      });
    } else {
      res.json({ success: false, message: "Retail not found" });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = self;
