module.exports = async (app, client) => {
  app.get("/public/isKeyAvailable", async (req, res) => {
    try {
      const token = req.query.key;

      if (token) {
        if (token.length == 20) {
          const result = await client
            .db("main")
            .collection("tokens")
            .findOne({ token, Status: "Unused" });

          if (result) {
            return res.json({
              status: "success",
              msg: "key is available.",
              data: {},
            });
          }
        }
      }
      return res.json({
        status: "error",
        msg: "key is not found or has already been used.",
        data: {},
      });
    } catch (error) {
      return res.json({
        status: "error",
        msg: "Internal server error.",
        data: {},
      });
    }
  });
};
