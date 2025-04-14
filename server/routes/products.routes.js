const products = require("../controllers/products.controller");
const router = require("express").Router();

router.route("/").get(products.get);

module.exports = router;
