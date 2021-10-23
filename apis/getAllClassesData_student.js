module.exports = async (app, client) => {
  app.get("/api/getAllClassesDataStudent", async (req, res) => {

    const user = req.user.name;

    try {
      let userData = await client
        .db("main")
        .collection("users")
        .findOne({ UserName: user });

      if (userData) {
        let document = await client
          .db("main")
          .collection("classes")
          .find({
            $or: [{ ClassData: userData.Grade }, { ClassData: "Everyone" }],
            $or: [{ Board: userData.Board }, { Board: "Everyone" }],
          })
          .toArray();

        if (document.length > 0) {
          return res.json({
            status: "success",
            msg: "found classes",
            data: { document },
          });
        } else {
          return res.json({
            status: "success",
            msg: "no classes scheduled",
            data: {},
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
