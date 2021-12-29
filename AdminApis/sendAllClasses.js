module.exports = async (app, client) => {
  app.get("/admin/sendAllClasses", async (req, res) => {
    let classes = await client
      .db("main")
      .collection("classes")
      .find({})
      .toArray();

    if (classes.length > 0) {
      return res.json({
        status: "success",
        msg: "found some data",
        data: { classes },
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
