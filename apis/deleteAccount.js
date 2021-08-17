module.exports = async (app, client) => {
  app.get("/api/deleteAccount", async (req, res) => {
    const user = req.user.name;

    try {
      await client.db("main").collection("users").deleteOne({ UserName: user });
    } catch (error) {
      return res.json({
        status: "error",
        msg: `Internal server error`,
        data: {},
      });
    }
    return res.json({
      status: "success",
      msg: `Account deleted`,
      data: {},
    }); 
  });
};
