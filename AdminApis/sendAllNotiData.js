module.exports = async (app, client) => {
  app.get("/admin/sendAllNotiData", async (req, res) => {
    let noti = await client
      .db("main")
      .collection("notifications")
      .find({})
      .toArray();

    if (noti.length > 0) {
      return res.json({
        status: "success",
        msg: "found some data",
        data: { noti },
      });
    } else {
      return res.json({
        status: "success",
        msg: "data not found",
        data: {},
      });
    }
  });
};
