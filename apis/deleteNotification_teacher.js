const { ObjectId } = require("mongodb");

module.exports = async (app, client) => {
  app.post("/api/deleteNotifications", async (req, res) => {

    const id = req.body.id;

    const accountType = req.user.account;

    if (accountType != "teacher") {
      return res.json({
        status: "error",
        msg: `Unauthorised Access`,
        data: {},
      });
    }

    if (!id) {
      return res.json({
        status: "error",
        msg: `Invalid request`,
        data: {},
      });
    }
    if (id.toString().trim() == "") {
      return res.json({
        status: "error",
        msg: `Invalid request`,
        data: {},
      });
    }

    client
      .db("main")
      .collection("notifications")
      .deleteOne({ _id: ObjectId(id) })
      .then((e) => {
        return res.json({
          status: "success",
          msg: `Notification removed`,
          data: {},
        });
      })
      .catch((err) => {
        return res.json({
          status: "error",
          msg: `Server error`,
          data: {},
        });
      });
  });
};
