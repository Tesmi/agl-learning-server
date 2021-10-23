module.exports = async (app, client) => {
  app.get("/api/getAllNotificationsTeacher", async (req, res) => {

    const user = req.user.name;
    const accountType = req.user.account;

    if (accountType != "teacher") {
      return res.json({
        status: "error",
        msg: `Unauthorised Access`,
        data: {},
      });
    }

    client
      .db("main")
      .collection("notifications")
      .find({ By: user })
      .toArray((err, doc) => {
        if (err) {
          return res.json({
            status: "error",
            msg: `Internal server error`,
            data: {},
          });
        }

        if (doc.length > 0) {
          return res.json({
            status: "success",
            msg: `found data`,
            data: { document: doc },
          });
        } else {
          return res.json({
            status: "success",
            msg: `no data found`,
            data: { document: "no_data" },
          });
        }
      });
  });
};
