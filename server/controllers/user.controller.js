const { user, optic, Sequelize } = require("../models");
const bcrypt = require("bcrypt");

let self = {};

self.get = async (req, res, next) => {
  try {
    const users = await user.findAll({
      include: [
        {
          model: optic,
          as: "optic",
          attributes: ["optic_name"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Data User found",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// Get By Id
self.getById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const response = await user.findByPk(id, {
      attributes: ["id", "name", "email", "role", "opticId"],
    });
    res.status(200).json({
      success: true,
      message: "Data found",
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

self.create = async (req, res, next) => {
  try {
    const { name, email, password, role, opticId } = req.body;

    const passwordHash = bcrypt.hashSync(password, 10);
    const createUser = await user.create({
      name: name,
      email: email,
      password: passwordHash,
      role: role,
      opticId: opticId,
    });

    res.status(201).json({
      success: true,
      message: "User successfully added",
      response: createUser,
    });
  } catch (error) {
    next(error);
  }
};

self.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, opticId } = req.body;

    // Check User
    const checkUser = await user.findByPk(id);
    if (!checkUser) {
      return res.status(400).json({
        success: false,
        message: "User not found!",
      });
    }

    // Update User
    const passwordHash = password
      ? bcrypt.hashSync(password, 10)
      : checkUser.password;
    await checkUser.update({
      name: name,
      email: email,
      password: passwordHash,
      role: role,
      opticId: opticId,
    });

    res.status(200).json({
      success: true,
      message: "User updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

self.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Check User
    const checkUser = await user.findByPk(id);
    if (!checkUser) {
      return res.status(400).json({
        success: false,
        message: "User not found!",
      });
    }

    // Update User
    await checkUser.update({
      status,
    });

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

self.delete = async (req, res, next) => {
  try {
    const { id } = req.params;

    const response = await user.findByPk(id);
    if (response) {
      await response.destroy();
      res.status(200).json({
        success: true,
        message: "User successfully deleted",
      });
    } else {
      res.json({ success: false, message: "Optic not found" });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = self;
