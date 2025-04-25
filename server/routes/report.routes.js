const report = require("../controllers/report.controller");
const router = require("express").Router();

router.route("/summary").get(report.getSummary);
router.route("/pos").get(report.getDailyReport);
router.route("/top-customers").get(report.getTopCustomer);

module.exports = router;
