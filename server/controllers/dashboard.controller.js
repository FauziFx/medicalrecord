const { patient, medicalrecord, Sequelize } = require("./../models");
let self = {};

// Statistik Card 1: Jumlah Patient
const getTotalPatients = async () => {
  const totalPatients = await patient.count();
  return totalPatients;
};

// Statistik Card 2: Patient This Month
const getPatientsThisMonth = async () => {
  const thisMonthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  ); // Tanggal 1 bulan ini
  const patientsThisMonth = await patient.count({
    where: {
      createdAt: {
        [Sequelize.Op.gte]: thisMonthStart, // createdAt >= tanggal 1 bulan ini
      },
    },
  });
  return patientsThisMonth;
};

// Statistik Card 3: Jumlah Medical Record
const getTotalMedicalRecords = async () => {
  const totalMedicalRecords = await medicalrecord.count();
  return totalMedicalRecords;
};

// Statistik Card 4: Medical Record This Month
const getMedicalRecordsThisMonth = async () => {
  const thisMonthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  ); // Tanggal 1 bulan ini
  const medicalRecordsThisMonth = await medicalrecord.count({
    where: {
      createdAt: {
        [Sequelize.Op.gte]: thisMonthStart, // createdAt >= tanggal 1 bulan ini
      },
    },
  });
  return medicalRecordsThisMonth;
};

const getPatientTrend = async (months) => {
  const currentDate = new Date(); // Tanggal sekarang
  const startDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - months,
    1
  ); // Tanggal awal sesuai jumlah bulan

  const patientTrend = await patient.findAll({
    attributes: [
      [
        Sequelize.fn("DATE_FORMAT", Sequelize.col("createdAt"), "%Y-%m"),
        "month",
      ], // Format bulan (contoh: 2025-04)
      [Sequelize.fn("COUNT", Sequelize.col("id")), "patientCount"], // Hitung jumlah pasien
    ],
    where: {
      createdAt: {
        [Sequelize.Op.gte]: startDate, // createdAt >= startDate
        [Sequelize.Op.lt]: currentDate, // createdAt < currentDate
      },
    },
    group: ["month"], // Group berdasarkan bulan
    order: [[Sequelize.literal("month"), "ASC"]], // Urutkan berdasarkan bulan
  });

  return patientTrend;
};

const getMedicalRecordTrend = async (months) => {
  const currentDate = new Date(); // Tanggal sekarang
  const startDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - months,
    1
  ); // Tanggal awal sesuai jumlah bulan

  const medicalRecordTrend = await medicalrecord.findAll({
    attributes: [
      [
        Sequelize.fn("DATE_FORMAT", Sequelize.col("createdAt"), "%Y-%m"),
        "month",
      ], // Format bulan (contoh: 2025-04)
      [Sequelize.fn("COUNT", Sequelize.col("id")), "recordCount"], // Hitung jumlah rekaman medis
    ],
    where: {
      createdAt: {
        [Sequelize.Op.gte]: startDate, // createdAt >= startDate
        [Sequelize.Op.lt]: currentDate, // createdAt < currentDate
      },
    },
    group: ["month"], // Group berdasarkan bulan
    order: [[Sequelize.literal("month"), "ASC"]], // Urutkan berdasarkan bulan
  });

  return medicalRecordTrend;
};

const getAgeDistribution = async () => {
  const ageGroups = await patient.findAll({
    attributes: [
      [
        Sequelize.literal(`CASE 
        WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 0 AND 18 THEN '0-18'
        WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 19 AND 35 THEN '19-35'
        WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 36 AND 50 THEN '36-50'
        ELSE '51+' END`),
        "ageGroup",
      ], // Kelompok usia
      [Sequelize.fn("COUNT", Sequelize.col("id")), "patientCount"], // Jumlah pasien di setiap kelompok
    ],
    group: ["ageGroup"], // Group berdasarkan usia
    order: [[Sequelize.literal("ageGroup"), "ASC"]], // Urutkan berdasarkan kelompok usia
  });

  return ageGroups.map((group) => ({
    ageGroup: group.dataValues.ageGroup, // Rentang usia
    count: group.dataValues.patientCount, // Jumlah pasien
  }));
};

const getGenderDistribution = async () => {
  const genderGroups = await patient.findAll({
    attributes: [
      "gender",
      [Sequelize.fn("COUNT", Sequelize.col("id")), "patientCount"],
    ],
    group: ["gender"],
  });

  return genderGroups.map((group) => ({
    gender: group.dataValues.gender,
    count: group.dataValues.patientCount,
  }));
};

const getOccupationDistribution = async () => {
  const occupationGroups = await patient.findAll({
    attributes: [
      [
        Sequelize.fn("LOWER", Sequelize.col("occupation")),
        "normalizedOccupation",
      ], // Normalisasi huruf kecil
      [Sequelize.fn("COUNT", Sequelize.col("id")), "patientCount"], // Hitung jumlah pasien
    ],
    group: ["normalizedOccupation"], // Group berdasarkan pekerjaan
    order: [[Sequelize.literal("patientCount"), "DESC"]], // Urutkan berdasarkan jumlah pasien terbanyak
    limit: 4, // Ambil hanya 4 data teratas
  });

  return occupationGroups.map((group) => ({
    occupation: group.dataValues.normalizedOccupation.trim(), // Hilangkan spasi tambahan
    count: group.dataValues.patientCount, // Jumlah pasien
  }));
};

self.get = async (req, res, next) => {
  // Statistic
  const totalPatients = await getTotalPatients();
  const patientsThisMonth = await getPatientsThisMonth();
  const totalMedicalRecords = await getTotalMedicalRecords();
  const medicalRecordsThisMonth = await getMedicalRecordsThisMonth();

  // Trend
  const patientData6Months = await getPatientTrend(6); // Tren pasien 6 bulan terakhir
  const medicalRecordData6Months = await getMedicalRecordTrend(6); // Tren rekaman medis 6 bulan terakhir
  const patientData12Months = await getPatientTrend(12); // Tren pasien 12 bulan terakhir
  const medicalRecordData12Months = await getMedicalRecordTrend(12); // Tren rekaman medis 12 bulan terakhir

  // Distribution
  const ageData = await getAgeDistribution();
  const genderData = await getGenderDistribution();
  const occupationData = await getOccupationDistribution();

  res.status(200).json({
    success: true,
    statistics: {
      totalPatients,
      patientsThisMonth,
      totalMedicalRecords,
      medicalRecordsThisMonth,
    },
    trends: {
      patientData6Months,
      medicalRecordData6Months,
      patientData12Months,
      medicalRecordData12Months,
    },
    distribution: {
      ageData,
      genderData,
      occupationData,
    },
  });
};

module.exports = self;
