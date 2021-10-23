module.exports = async (app, client) => {
  app.post("/api/uploadRecycleContent", async (req, res) => {
    const user = req.user.name;
    const userAccount = req.user.account;
    const db = client.db("main").collection("recycle");

    if (userAccount != "teacher") {
      return res.json({
        status: "error",
        msg: `Unauthorised Access`,
        data: {},
      });
    }

    const data = {
      Description: req.body.description,
      VideoUrl: req.body.videoUrl,
      Board: req.body.board,
      Class: req.body.classData,
      PostedBy: user,
      Date: new Date().getTime().toString(),
    };

    await db
      .insertOne(data)
      .then(() => {
        return res.json({
          status: "success",
          msg: `Inserted Data`,
          data: {},
        });
      })
      .catch(() => {
        return res.json({
          status: "error",
          msg: `Internal server error`,
          data: {},
        });
      });
  });
};
