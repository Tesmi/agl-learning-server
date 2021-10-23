module.exports = async (app, client) => {
  app.get("/public/findUserInfo", async (req, res) => {
    let user = req.query.user;
    if (!user) {
      return res.json({
        status: "error",
        msg: "user is invalid.",
        data: {},
      });
    }

    await client
      .db("main")
      .collection("users")
      .findOne({
        $or: [
          { UserName: user.trim().toUpperCase() },
          {
            Email: user.trim().toLowerCase(),
          },
        ],
      })
      .then((e) => {
        if (e) {
          return res.json({
            status: "success",
            msg: "Internal server error.",
            data: { username: e.UserName, email: e.Email },
          });
        } else {
          return res.json({
            status: "error",
            msg: "No Account Found.",
            data: {},
          });
        }
      })
      .catch((err) => {
        return res.json({
          status: "error",
          msg: "Internal server error.",
          data: {},
        });
      });
  });
};
