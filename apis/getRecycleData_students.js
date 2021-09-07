module.exports = async (app, client) => {
  app.get("/api/getAllRecycleDataStudent", async (req, res) => {
    const user = req.user.name;

    try {
      let userData = await client
        .db("main")
        .collection("users")
        .findOne({ UserName: user });

      if (userData) {
        let recycle = await client
          .db("main")
          .collection("recycle")
          .find({
            $or: [{ Class: userData.Grade }, { Class: "Everyone" }],
            $or: [{ Board: userData.Board }, { Board: "Everyone" }],
          })
          .toArray();

        if (recycle.length > 0) {
          return res.json({
            status: "success",
            msg: `Recycle data fetched`,
            data: { recycle },
          });
        } else {
          return res.json({
            status: "success",
            msg: `No recycle data found.`,
            data: { recycle: null },
          });
        }
      } else {
        throw new Error("error");
      }
    } catch (error) {
      return res.json({
        status: "error",
        msg: `Internal server error`,
        data: {},
      });
    }
  });
};
