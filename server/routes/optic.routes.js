const optic = require("./../controllers/optic.controller");
const router = require("express").Router();

router.route("/").get(optic.get).post(optic.create);
router
  .route("/:id")
  .get(optic.getById)
  .patch(optic.update)
  .delete(optic.delete);

module.exports = router;
