const { ObjectId } = require("mongodb");

module.exports = async (app, client) => {
  app.get("/api/deleteRecycleData", async (req, res) => {
    const id = req.query.id;
    const user = req.user.name;
    const accountType = req.user.account;

    if (!id) {
      return res.json({
        status: "error",
        msg: `Unauthorised Access`,
        data: {},
      });
    }

    if (accountType != "teacher") {
      return res.json({
        status: "error",
        msg: `Unauthorised Access`,
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
      .collection("recycle")
      .deleteOne({ _id: ObjectId(id) })
      .then((e) => {
        return res.json({
          status: "success",
          msg: `Content removed`,
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
