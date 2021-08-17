module.exports = async (app, client) => {
  app.post("/api/deleteScheduledClass", async (req, res) => {

    const fileUrl = req.body.fileUrl;

    const accountType = req.user.account;

    if (accountType != "teacher") {
      return res.json({
        status: "error",
        msg: `Unauthorised Access`,
        data: {},
      });
    }

    if (!fileUrl) {
      return res.json({
        status: "error",
        msg: `Invalid request`,
        data: {},
      });
    }
    if (fileUrl.toString().trim() == "") {
      return res.json({
        status: "error",
        msg: `Invalid request`,
        data: {},
      });
    }

    client
      .db("main")
      .collection("classes")
      .deleteOne({ URL: fileUrl })
      .then((e) => {
        return res.json({
          status: "success",
          msg: `Class schedule removed`,
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
