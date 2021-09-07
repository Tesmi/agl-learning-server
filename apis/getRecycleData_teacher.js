module.exports = async (app, client) => {
  app.get("/api/getAllRecycleData", async (req, res) => {
    const user = req.user.name;

    const accountType = req.user.account;

    if (accountType != "teacher") {
      return res.json({
        status: "error",
        msg: `Unauthorised Access`,
        data: {},
      });
    }

    await client
      .db("main")
      .collection("recycle")
      .find({
        PostedBy: user,
      })
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
            data: { documents: doc },
          });
        } else {
          return res.json({
            status: "success",
            msg: `no data found`,
            data: { documents: "no_data" },
          });
        }
      });
  });
};
