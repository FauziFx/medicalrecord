const warranty = require("../controllers/warranty.controller");
const warrantyclaim = require("../controllers/warrantyclaim.controller");
const router = require("express").Router();

router.route("/").get(warranty.get).post(warranty.create);
router.route("/claim").get(warrantyclaim.get).post(warrantyclaim.create);
router.route("/claim/:id").delete(warrantyclaim.delete);
router
  .route("/:id")
  .get(warranty.getById)
  .patch(warranty.update)
  .delete(warranty.delete);

module.exports = router;
