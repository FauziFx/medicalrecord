const report = require("../controllers/report.controller");
const router = require("express").Router();

router.route("/summary").get(report.getSummary);
router.route("/pos").get(report.getDailyReport);
router.route("/top-customers").get(report.getTopCustomer);
router.route("/transaction-trend").get(report.getTransactionTrend);
router.route("/top-selling").get(report.getTopSellingProducts);
router.route("/summary-export").get(report.getSummaryExport);

module.exports = router;
