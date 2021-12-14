const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const config = require("../config");

module.exports = async (app, client) => {
  app.get("/public/login", async (req, res) => {
    try {
      let userNameOrEmail = req.query.user;
      let password = req.query.password;
      let fcm = req.query.fcm;

      if (!userNameOrEmail || !password) {
        return res.json({
          status: "error",
          msg: `Invalid username/email or password`,
          data: {},
        });
      }

      client
        .db("main")
        .collection("users")
        .findOne({
          $or: [
            { UserName: userNameOrEmail.trim().toUpperCase() },
            {
              Email: userNameOrEmail.trim().toLowerCase(),
            },
          ],
        })
        .then((e) => {
          if (e) {
            let hashedPassword = crypto
              .createHash("sha512")
              .update(password.concat(e.Salt))
              .digest("hex");

            if (hashedPassword == e.Password) {
              const user = { name: e.UserName, account: e.AccountType };
              const accessToken = generateAccessToken(user);
              const refreshToken = jwt.sign(user, config.REFRESH_TOKEN_SECRET);
              pushRefreshTokens(
                accessToken,
                refreshToken,
                e.AccountType,
                client,
                res,
                fcm,
                e.UserName
              );
            } else {
              return res.json({
                status: "error",
                msg: `Invalid password`,
                data: {},
              });
            }
          } else {
            return res.json({
              status: "error",
              msg: `Invalid username/email or password`,
              data: {},
            });
          }
        })
        .catch((err) => {
          throw new Error("something went wrong");
        });
    } catch (error) {
      return res.json({
        status: "error",
        msg: `Internal server error`,
        data: {},
      });
    }
  });

  app.get("/public/loginToken", (req, res) => {
    try {
      const refreshToken = req.query.token;
      if (!refreshToken) {
        return res.json({
          status: "error",
          msg: `invalid_refresh_token`,
          data: {},
        });
      }

      if (refreshToken.trim() == "") {
        return res.json({
          status: "error",
          msg: `invalid_refresh_token`,
          data: {},
        });
      }

      client
        .db("main")
        .collection("loginTokens")
        .findOne({ token: refreshToken })
        .then((e) => {
          if (!e) {
            return res.json({
              status: "error",
              msg: `invalid_refresh_token`,
              data: {},
            });
          }
          if (e.token == refreshToken) {
            jwt.verify(
              refreshToken,
              config.REFRESH_TOKEN_SECRET,
              (err, user) => {
                if (err) {
                  return res.json({
                    status: "error",
                    msg: `invalid_refresh_token`,
                    data: {},
                  });
                }
                const accessToken = generateAccessToken({
                  name: user.name,
                  account: user.account,
                });
                return res.json({
                  status: "success",
                  msg: `login successfull`,
                  data: { accessToken, accountType: user.account },
                });
              }
            );
          } else {
            return res.json({
              status: "error",
              msg: `Internal server error`,
              data: {},
            });
          }
        })
        .catch((err) => {
          return res.json({
            status: "error",
            msg: `Internal server error`,
            data: {},
          });
        });
    } catch (error) {
      return res.json({
        status: "error",
        msg: `Invalid request`,
        data: {},
      });
    }
  });

  app.get("/public/logout", (req, res) => {
    //delete the refresh token from the database
    let token = req.query.token;

    client
      .db("main")
      .collection("loginTokens")
      .findOneAndDelete({ token: token })
      .then((e) => {
        res.sendStatus(200);
      });
  });
};

function generateAccessToken(user) {
  return jwt.sign(user, config.ACCESS_TOKEN_SECRET, {
    expiresIn: "1hr",
  });
}

//push refresh tokens into the database
pushRefreshTokens = async (
  accessToken,
  refreshToken,
  accountType,
  client,
  res,
  fcm,
  username
) => {
  await client
    .db("main")
    .collection("loginTokens")
    .insertOne({
      token: refreshToken,
      UserName: username,
      FCM: fcm,
    })
    .then((e) => {
      return res.json({
        status: "success",
        msg: `login successfull`,
        data: { accessToken, refreshToken, accountType },
      });
    })
    .catch((err) => {
      throw new Error("something went wrong");
    });
};
