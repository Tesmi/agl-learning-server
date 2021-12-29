module.exports = async (app, client) => {
  app.get("/admin/sendRecycleData", async (req, res) => {
    let recycle = await client
      .db("main")
      .collection("recycle")
      .find({})
      .toArray();

    if (recycle.length > 0) {
      return res.json({
        status: "success",
        msg: "found some data",
        data: { recycle },
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
