const user = require("../controllers/user.controller");
const router = require("express").Router();

router.route("/").post(user.create).get(user.get);
router.route("/:id").get(user.getById).patch(user.update).delete(user.delete);
router.route("/status/:id").patch(user.updateStatus);

module.exports = router;
