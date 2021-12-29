module.exports = async (app, client) => {
  app.get("/admin/sendAllUsers", async (req, res) => {
    let users = await client.db("main").collection("users").find({}).toArray();

    if (users.length > 0) {
      return res.json({
        status: "success",
        msg: "found some data",
        data: { users },
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
