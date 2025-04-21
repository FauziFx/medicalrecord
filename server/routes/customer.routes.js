const customer = require("../controllers/customer.controller");
const router = require("express").Router();

router.route("/").get(customer.get).post(customer.create);
router
  .route("/:id")
  .get(customer.getById)
  .patch(customer.update)
  .delete(customer.delete);

module.exports = router;
