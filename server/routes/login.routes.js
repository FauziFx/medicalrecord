const auth = require("./../controllers/auth.controller");
const router = require("express").Router();

router.route("/").post(auth.login);

module.exports = router;
