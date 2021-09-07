const crypto = require("crypto");
const childProc = require("child_process");

module.exports = async (app, client) => {
  app.get("/public/updatePassword", async (req, res) => {
    console.log("this shit is called");

    let username = req.query.username;
    let newPassword = req.query.password;

    if (!username || !newPassword) {
      return res.json({
        status: "error",
        msg: "invalid request.",
        data: {},
      });
    }

    let userData = await client.db("main").collection("users").findOne({
      UserName: username,
    });

    if (userData) {
      let newPasswordHashed = null;

      try {
        newPasswordHashed = crypto
          .createHash("sha512")
          .update(newPassword.concat(userData.Salt))
          .digest("hex");
      } catch (error) {
        throw new Error("Invalid Password");
      }

      client
        .db("main")
        .collection("users")
        .updateOne(
          { UserName: username },
          { $set: { Password: newPasswordHashed } }
        )
        .then((e) => {
          res.json({
            status: "success",
            msg: "Password updated successfully",
            data: {},
          });

          childProc.exec(
            `sudo prosodyctl deluser ${username}@jitsi.aglofficial.com`
          );

          childProc.exec(
            `sudo prosodyctl register ${username} jitsi.aglofficial.com ${newPassword}`
          );

          return;
        })
        .catch((err) => {
          return res.json({
            status: "error",
            msg: "internal server error.",
            data: {},
          });
        });
    } else {
      return res.json({
        status: "error",
        msg: "internal server error.",
        data: {},
      });
    }
  });
};
