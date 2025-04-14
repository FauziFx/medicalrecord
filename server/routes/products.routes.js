const products = require("../controllers/products.controller");
const router = require("express").Router();

router.route("/").get(products.get).post(products.create);
router.route("/:id").get(products.getById);

module.exports = router;
