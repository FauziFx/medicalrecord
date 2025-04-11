const categories = require("../controllers/categories.controller");
const router = require("express").Router();

router.route("/").get(categories.get).post(categories.create);
router.route("/:id").patch(categories.update).delete(categories.delete);

module.exports = router;
