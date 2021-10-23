module.exports = async (app, client) => {
  app.get("/api/getUserProfileInfo", async (req, res) => {

    const user = req.user.name;

    const userData = await client
      .db("main")
      .collection("users")
      .findOne({ UserName: user });

    if (userData) {
      return res.json({
        status: "success",
        msg: `success`,
        data: { userData },
      });
    } else {
      return res.json({
        status: "error",
        msg: `Unexpected error`,
        data: {},
      });
    }
  });
};
