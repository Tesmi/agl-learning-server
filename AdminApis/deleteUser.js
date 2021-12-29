const { ObjectId } = require("mongodb");
const childProc = require("child_process");

module.exports = async (app, client) => {
  app.get("/admin/deleteUser", async (req, res) => {
    const id = req.query.id;

    if (id) {
      await client
        .db("main")
        .collection("users")
        .findOne({ _id: ObjectId(id) })
        .then((e) => {
          if (e.AccountType == "teacher") {
            let userId = e.UserName;
            childProc.exec(
              `sudo prosodyctl deluser ${userId}@jitsi.aglofficial.com`
            );
          }
        })
        .catch((err) => {
          return res.send("error");
        });

      await client
        .db("main")
        .collection("users")
        .deleteOne({ _id: ObjectId(id) })
        .then((e) => {
          return res.send("success");
        })
        .catch((err) => {
          return res.send("error");
        });
    } else {
      res.send("error");
    }
  });
};
