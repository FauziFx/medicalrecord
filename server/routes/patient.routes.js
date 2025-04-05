const patient = require("./../controllers/patient.controller");
const router = require("express").Router();

router.route("/").get(patient.get).post(patient.create);
router.route("/:id/restore").put(patient.restore);
router
  .route("/:id")
  .get(patient.getById)
  .patch(patient.update)
  .delete(patient.delete);

module.exports = router;
