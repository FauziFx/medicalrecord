const stock = require("../controllers/stock.controller");
const router = require("express").Router();

router.route("/adjustments").get(stock.getAdjustments);

module.exports = router;
