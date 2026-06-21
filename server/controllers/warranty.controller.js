const { warranty, warrantyclaim, optic, Sequelize } = require("../models");
const Op = Sequelize.Op;
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");

// Activate the plugin
dayjs.extend(utc);

let self = {};

// Get ALl
self.get = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const offset = (page - 1) * limit;

    const { name, opticId, startDate, endDate } = req.query;

    const whereCondition = {};

    // Filter by name (search) jika diisi
    if (name) {
      whereCondition.name = { [Op.like]: `%${name}%` };
    }

    // Filter by opticId jika diisi
    if (opticId) {
      whereCondition.opticId = opticId;
    }

    // Filter date range berdasarkan createdAt dari tabel patient
    if (startDate && endDate) {
      whereCondition.createdAt = {
        [Op.between]: [startDate, endDate],
      };
    } else if (startDate) {
      whereCondition.createdAt = { [Op.gte]: startDate };
    } else if (endDate) {
      whereCondition.createdAt = { [Op.lte]: endDate };
    }

    // Query untuk mendapatkan data pasien dengan pagination
    const { count, rows } = await warranty.findAndCountAll({
      include: [
        {
          model: optic,
          as: "optic",
          attributes: ["optic_name"],
        },
      ],
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

// Get By Id
self.getById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const response = await warranty.findByPk(id, {
      include: [
        {
          model: optic,
          as: "optic",
          attributes: ["optic_name"],
        },
        {
          model: warrantyclaim,
          as: "warrantyclaim",
        },
      ],
    });
    res.status(200).json({
      success: true,
      message: "Data found",
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

// Create warranty
self.create = async (req, res, next) => {
  const {
    name,
    frame,
    lens,
    od,
    os,
    warranty_frame,
    warranty_lens,
    expire_frame,
    expire_lens,
    opticId,
    createdAt,
  } = req.body;
  try {
    const response = await warranty.create(
      {
        name,
        frame,
        lens,
        od,
        os,
        warranty_frame,
        warranty_lens,
        expire_frame,
        expire_lens,
        opticId,
        createdAt,
      },
      {
        individualHooks: true, // Menjalankan hooks (jika ada).
      },
    );
    res.status(201).json({
      success: true,
      message: `Warranty has been Submitted successfully`,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

// Update
self.update = async (req, res, next) => {
  const {
    name,
    frame,
    lens,
    od,
    os,
    warranty_frame,
    warranty_lens,
    expire_frame,
    expire_lens,
    opticId,
    createdAt,
  } = req.body;
  console.log({
    name,
    frame,
    lens,
    od,
    os,
    warranty_frame,
    warranty_lens,
    expire_frame,
    expire_lens,
    opticId,
    createdAt,
  });

  const { id } = req.params;
  try {
    const checkWarranty = await warranty.findByPk(id);
    if (!checkWarranty) {
      return res.json({
        success: false,
        message: "Warranty not found",
      });
    }

    await warranty.update(
      {
        name,
        frame,
        lens,
        od,
        os,
        warranty_frame,
        warranty_lens,
        expire_frame,
        expire_lens,
        opticId,
        createdAt,
      },
      {
        where: { id },
        individualHooks: true, // Menjalankan hooks (jika ada).
      },
    );
    return res.status(201).json({
      success: true,
      message: "Update successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Delete
self.delete = async (req, res, next) => {
  const { id } = req.params;
  try {
    const response = await warranty.findByPk(id);
    if (response) {
      await response.destroy();
      res.status(200).json({
        success: true,
        message: "Warranty deleted",
      });
    } else {
      res.json({ success: false, message: "Warranty not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

self.add = async (req, res, next) => {
  try {
    const { n, f, ln, r, l, wf, wl, i } = req.query;
    // 1. Ambil semua key yang dikirim dan cek apakah ada yang kosong/hanya spasi
    const requiredFields = { n, f, ln, r, l, i };
    const missingFields = [];

    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value || value.toString().trim() === "") {
        missingFields.push(key);
      }
    }

    // 2. Jika ada field yang kosong, hentikan proses dan beri peringatan
    if (missingFields.length > 0) {
      return res.status(400).send(`
      <div style="text-align:center; padding:2rem; font-family:sans-serif; border: 2px solid red; border-radius: 10px; margin: 20px;">
        <h2 style="color:red;">Data Belum Lengkap!</h2>
        <p>Mohon isi semua kolom di Excel. Kolom yang kosong: <br> 
           <b style="color:red;">${missingFields.join(", ")}</b>
        </p>
        <a href="javascript:history.back()" style="color:blue; text-decoration:none; font-weight:bold;">[ <E2><86><90> Kembali ke Excel ]</a>
      </div>
    `);
    }

    const opticData = {
      1: "INDAH MA",
      2: "CALYA",
      3: "FREED",
      4: "GRANDMAX",
      5: "AWN",
      6: "BALONG",
      7: "KR SEMBUNG",
      8: "MAJALENGKA",
      10: "PERJUANGAN",
      11: "SINDANG",
      12: "SUMBER",
      13: "GEBANG",
      14: "WALED",
      16: "SIGRA",
      17: "SIGRA BLACK",
      18: "SIGRA GREY",
      19: "TAYO",
      20: "TAYO BARU",
      23: "BUNTET",
      32: "CITRALAND",
      33: "LEMAHABANG",
      34: "XPANDER",
      35: "CILIMUS",
    };

    // // 3. Validasi apakah Optic yang diinput ada di daftar database kita
    // const selectedOpticId = opticData[optic.trim()];
    // if (!selectedOpticId) {
    //   return res.status(400).send(`<h2>Error: Cabang Optic "${optic}" tidak terdaftar!</h2>`);
    // }

    const dateNow = dayjs().format("YYYY-MM-DD");
    const getExpiry = (value) => {
      // Check for null, undefined, or empty string ""
      if (value === null || value === undefined || value === "") {
        return dateNow;
      }

      if (value === "-") {
        return dateNow;
      }

      // Logic: "6" results in Months, others result in Years
      const unit = value === "6" ? "M" : "y";

      return dayjs.utc(dateNow).add(value, unit).format("YYYY-MM-DD");
    };

    const expire_frame = getExpiry(wf);
    const expire_lens = getExpiry(wl);

    await warranty.create(
      {
        name: n,
        frame: f,
        lens: ln,
        od: r,
        os: l,
        warranty_frame: wf || "-",
        warranty_lens: wl || "-",
        expire_frame,
        expire_lens,
        opticId: i,
      },
      {
        individualHooks: true,
      },
    );

    res.send(`
            <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f0f2f5; }
                        .card { text-align: center; padding: 2rem; background: white; border-radius: 12px; shadow: 0 2px 10px rgba(0,0,0,0.1); }
                        .check { color: #217346; font-size: 50px; }
                        .btn { margin-top: 20px; display: inline-block; padding: 10px 20px; background: #217346; color: white; text-decoration: none; border-radius: 5px; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <div class="check">✔</div>
                        <h2>Data Terinput!</h2>
                        <p>
                            <b>${n}</b>
                            <br>
                            ${opticData[i]}
                        </p>
                        <a href="ms-excel:" class="btn">Kembali ke Excel</a>
                    </div>
                    <script>
                        // Otomatis kembali setelah 2 detik
                        setTimeout(() => {
                            window.location.href = "ms-excel:"; 
                            window.close(); 
                        }, 2500);
                    </script>
                </body>
            </html>
        `);
  } catch (err) {
    next(err);
  }
};

module.exports = self;
