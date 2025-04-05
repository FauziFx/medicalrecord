const dashboard = require("../controllers/dashboard.controller");
const router = require("express").Router();

router.route("/summary").get(dashboard.get);

module.exports = router;
