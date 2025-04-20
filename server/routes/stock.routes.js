const stock = require("../controllers/stock.controller");
const router = require("express").Router();

router
  .route("/adjustments")
  .get(stock.getAdjustments)
  .post(stock.createAdjustment);
router.route("/managements").get(stock.getManagements);

module.exports = router;
