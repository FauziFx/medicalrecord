const express = require("express");
const createError = require("http-errors");
const fs = require("fs");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

// Middleware
const ErrorHandler = require("./middlewares/ErrorHandler.js");
const Authenticate = require("./middlewares/Authenticate.js");
const CheckInputs = require("./middlewares/CheckInputs.js");

// Router
const indexRouter = require("./routes/index");
const loginRouter = require("./routes/login.routes");
const opticRouter = require("./routes/optic.routes");
const patientRouter = require("./routes/patient.routes");
const medicalRecordRouter = require("./routes/medicalrecord.routes");
const medicalConditionRouter = require("./routes/medicalcondition.routes");
const userRouter = require("./routes/user.routes");
const warrantyRouter = require("./routes/warranty.routes");
const dashboardRouter = require("./routes/dashboard.routes");

const categoriesRouter = require("./routes/categories.routes");
const productsRouter = require("./routes/products.routes");

const optic = require("./controllers/optic.controller");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/", indexRouter);

// Get Image
app.get("/v1/upload/image/:imageName", (req, res) => {
  const imageName = req.params.imageName;
  // const readStream = fs.createReadStream(`uploads/${imageName}`);
  // readStream.pipe(res);
  const imagePath = `uploads/${imageName}`;
  fs.access(imagePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File does not exist
      return res.status(404).json({ error: "Image not found" });
    }

    // File exists, stream it to the client
    const readStream = fs.createReadStream(imagePath);
    readStream.on("error", (error) => {
      // Handle potential errors during reading
      res.status(500).json({ error: "Error reading the image" });
    });

    readStream.pipe(res);
  });
});

app.use("/v1/login", CheckInputs, loginRouter);
app.use("/v1/warranty", CheckInputs, warrantyRouter);
app.get("/v1/optic", optic.get);
// Authentication
app.use(Authenticate);

// Protected Route
// Medical Record
app.use("/v1/optic", CheckInputs, opticRouter);
app.use("/v1/patient", CheckInputs, patientRouter);
app.use("/v1/medicalrecord", CheckInputs, medicalRecordRouter);
app.use("/v1/user", CheckInputs, userRouter);
app.use("/v1/medicalcondition", medicalConditionRouter);
app.use("/v1/dashboard", dashboardRouter);

// Backoffice & POS
app.use("/v1/categories", CheckInputs, categoriesRouter);
app.use("/v1/products", productsRouter);

// error handler
app.use(ErrorHandler);

app.listen(3000, () => {
  console.log(`Example app listening on port 3000`);
});
// module.exports = app;
