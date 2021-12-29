module.exports = async (app, client) => {
  app.get("/admin/deleteKey", async (req, res) => {
    const token = req.query.token;

    if (token) {
      await client
        .db("main")
        .collection("tokens")
        .deleteOne({ token })
        .then((e) => {
          return res.send("success");
        })
        .catch((err) => {
          return res.send("error");
        });
    } else {
      res.send("error");
    }
  });
};
