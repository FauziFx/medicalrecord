const type = require("../controllers/transactiontype.controller");
const router = require("express").Router();

router.route("/").get(type.get).post(type.create);
router.route("/:id").get(type.getById).patch(type.update).delete(type.delete);

module.exports = router;
