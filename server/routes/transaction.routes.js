const transaction = require("../controllers/transaction.controller");
const router = require("express").Router();

router.route("/").post(transaction.create);

module.exports = router;
