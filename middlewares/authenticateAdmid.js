const config = require("../config");

module.exports = function authenticateAdmin(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    return res.sendStatus(401);
  }

  if (token != config.ACCESS_TOKEN_ADMIN) {
    return res.sendStatus(403);
  }
  next();
};
