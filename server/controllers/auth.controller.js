const { user, optic, Sequelize } = require("./../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

let self = {};

self.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const dataUser = await user.findOne({
      where: {
        email: email,
      },
      include: {
        model: optic,
        as: "optic",
      },
    });
    if (!dataUser) {
      res.json({
        success: false,
        message: "Email not registered",
      });
    } else {
      if (dataUser.status == 0) {
        res.json({
          success: false,
          message:
            "Your account is inactive. Please contact the administrator for assistance.",
        });
      } else {
        // Validate password
        const matchPassword = await bcrypt.compare(password, dataUser.password);
        if (!matchPassword) {
          return res.json({
            success: false,
            message: "Wrong password!",
          });
        }

        //creating a access token
        const token = jwt.sign(
          {
            id: dataUser.id,
            name: dataUser.name,
            email: dataUser.email,
            role: dataUser.role,
            status: dataUser.status,
            opticId: dataUser.opticId,
          },
          process.env.TOKEN_SECRET,
          {
            expiresIn: "90d",
          }
        );

        res.status(200).json({
          success: true,
          message: "User logged in successfully",
          data: {
            token: token,
          },
        });
      }
    }
  } catch (error) {
    next(error);
  }
};

module.exports = self;
