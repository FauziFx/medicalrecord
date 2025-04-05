const jwt = require("jsonwebtoken");

const Authenticate = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ error: "Access Denied. No token provided." });
  }

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ error: "Invalid Token" });
    }

    req.user = user;
    next();
  });
};

module.exports = Authenticate;
