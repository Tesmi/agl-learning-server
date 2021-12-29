module.exports = async (app, client) => {
  app.get("/admin/sendAllKeys", async (req, res) => {
    let keys = await client.db("main").collection("tokens").find({}).toArray();

    if (keys.length > 0) {
      return res.json({
        status: "success",
        msg: "found some data",
        data: { keys },
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
