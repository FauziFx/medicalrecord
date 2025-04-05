const CheckInputs = (req, res, next) => {
  const inputs = req.body;
  for (const key in inputs) {
    if (inputs[key] === "") {
      return res.status(400).send(`Input ${key} tidak boleh kosong`);
    }
  }
  next();
};

module.exports = CheckInputs;
