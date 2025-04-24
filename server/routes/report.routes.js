const report = require("../controllers/report.controller");
const router = require("express").Router();

router.route("/pos").get(report.getDailyReport);

module.exports = router;
