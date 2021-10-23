module.exports = async (app, client) => {
  app.get("/api/getAllFilesStudent", async (req, res) => {

    const user = req.user.name;

    try {
      let userData = await client
        .db("main")
        .collection("users")
        .findOne({ UserName: user });

      if (userData) {
        let files = await client
          .db("main")
          .collection("files")
          .find({
            $or: [{ ClassName: userData.Grade }, { ClassName: "Everyone" }],
            $or: [{ Board: userData.Board }, { Board: "Everyone" }],
          })
          .toArray();

        if (files.length > 0) {
          return res.json({
            status: "success",
            msg: `Files fetched`,
            data: { files },
          });
        } else {
          return res.json({
            status: "success",
            msg: `No files found.`,
            data: { files: null },
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
