const transaction = require("../controllers/transaction.controller");
const router = require("express").Router();

router.route("/").get(transaction.get).post(transaction.create);
router.route("/:id").get(transaction.getById);

module.exports = router;
