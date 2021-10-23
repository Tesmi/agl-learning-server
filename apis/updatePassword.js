const crypto = require("crypto");
const childProc = require("child_process");

module.exports = async (app, client) => {
  app.post("/api/updatePassword", async (req, res) => {
    try {
      const user = req.user.name;
      let currentPassword = req.body.currentPassword;
      let newPassword = req.body.newPassword;
      let confirmNewPassword = req.body.confirmNewPassword;

      if (!currentPassword || !newPassword || !confirmNewPassword) {
        return res.json({
          status: "error",
          msg: "Invalid request, try again later",
          data: {},
        });
      }

      currentPassword = currentPassword.toString();
      newPassword = newPassword.toString();
      confirmNewPassword = confirmNewPassword.toString();

      if (newPassword.length < 8) {
        return res.json({
          status: "error",
          msg: "New Password is very short.",
          data: {},
        });
      }

      if (confirmNewPassword != newPassword) {
        return res.json({
          status: "error",
          msg: "New password and confirm new password doesn't match.",
          data: {},
        });
      }

      let userData = await client
        .db("main")
        .collection("users")
        .findOne({ UserName: user });

      if (!userData) {
        return res.json({
          status: "error",
          msg: "Invalid request, try again later",
          data: {},
        });
      }

      let userCurrentPasswordHashed;

      try {
        userCurrentPasswordHashed = crypto
          .createHash("sha512")
          .update(currentPassword.concat(userData.Salt))
          .digest("hex");
      } catch (error) {
        throw new Error("Invalid Password");
      }

      if (userCurrentPasswordHashed == userData.Password) {
        let newHashedPassword;
        try {
          newHashedPassword = crypto
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
            { UserName: user },
            { $set: { Password: newHashedPassword } }
          )
          .then((e) => {
            res.json({
              status: "success",
              msg: "Password updated successfully",
              data: {},
            });

            childProc.exec(
              `sudo prosodyctl deluser ${user}@jitsi.aglofficial.com`
            );

            childProc.exec(
              `sudo prosodyctl register ${user} jitsi.aglofficial.com ${newPassword}`
            );

            return;
          })
          .catch((err) => {
            return res.json({
              status: "error",
              msg: "Internal server error",
              data: {},
            });
          });
      } else {
        return res.json({
          status: "error",
          msg: "Current password is incorrect",
          data: {},
        });
      }
    } catch (error) {
      return res.json({
        status: "error",
        msg: "Internal server error",
        data: {},
      });
    }
  });
};
