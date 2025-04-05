const medicalrecord = require("../controllers/medicalrecord.controller");
const router = require("express").Router();
const { uploadImages } = require("../middlewares/Upload.js");

router
  .route("/")
  .get(medicalrecord.get)
  .post(uploadImages.single("image"), medicalrecord.create);
router.route("/:id/restore").put(medicalrecord.restore);
router.route("/:id").delete(medicalrecord.delete);
module.exports = router;
