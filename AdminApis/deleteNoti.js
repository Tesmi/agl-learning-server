const { ObjectId } = require("mongodb");

module.exports = async (app, client) => {
  app.get("/admin/deleteNotification", async (req, res) => {
    const id = req.query.id;

    if (id) {
      await client
        .db("main")
        .collection("notifications")
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
