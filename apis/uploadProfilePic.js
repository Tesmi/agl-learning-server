const multer = require("multer");
const upload = multer({ dest: "./profile/" });
const fs = require("fs");
const path = require("path");

module.exports = async (app, client) => {
  app.post(
    "/api/uploadProfilePic",
    upload.single("profile"),
    async (req, res, next) => {
      fs.rename(
        __dirname + "/../" + req.file.path,
        __dirname + "/../" + req.file.path + ".jpg",
        function (err) {}
      );

      const fullPath = req.file.filename + ".jpg";
      await client
        .db("main")
        .collection("users")
        .findOne({ UserName: req.user.name })
        .then((e) => {
          if (e.profilePic) {
            let pathToPic = path.join(
              __dirname + "/../profile/" + e.profilePic
            );
            if (fs.existsSync(pathToPic)) {
              fs.unlink(pathToPic, (err) => {});
            }
          }
        })
        .catch((err) => {});

      await client
        .db("main")
        .collection("users")
        .updateOne(
          { UserName: req.user.name },
          { $set: { profilePic: fullPath } }
        )
        .then((e) => {
          res.send({ status: true });
        })
        .catch((err) => {
          res.send({ status: false });
        });
    }
  );
};
