const retail = require("../controllers/retail.controller");
const router = require("express").Router();

router.route("/").get(retail.get).post(retail.create);
router.route("/receipt").get(retail.getLastReceipt);
router.route("/:id").patch(retail.update).delete(retail.delete);

module.exports = router;
