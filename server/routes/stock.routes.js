const stock = require("../controllers/stock.controller");
const router = require("express").Router();

router
  .route("/adjustments")
  .get(stock.getAdjustments)
  .post(stock.createAdjustment);
router.route("/managements").get(stock.getManagements);
router.route("/lens").get(stock.getStockLens);
router.route("/lens/detail").get(stock.getStockByName);

module.exports = router;
