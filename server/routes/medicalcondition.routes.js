const medicalcondition = require("../controllers/medicalcondition.controller");
const router = require("express").Router();

router.route("/").get(medicalcondition.get);

module.exports = router;
