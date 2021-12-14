const fs = require("fs");
const node_path = require("path");

module.exports = async (app, client) => {
  app.get("/api/getAllRecordedVideos", async (req, res) => {
    const user = req.user.name;

    try {
      let userData = await client
        .db("main")
        .collection("users")
        .findOne({ UserName: user });

      if (userData) {
        let document = await client
          .db("main")
          .collection("recordedVideos")
          .find({
            $or: [{ Class: userData.Grade }, { Class: "Everyone" }],
            $or: [{ Board: userData.Board }, { Board: "Everyone" }],
          })
          .toArray();

        for (let i = 0; i < document.length; i++) {
          let vidName = document[i].VideoName + ".mp4";
          let path = "./recordings/" + vidName;
          if (!fs.existsSync(path)) {
            document.splice(
              document.findIndex((a) => a.id === document[i].VideoName),
              1
            );
          }
        }

        if (document.length > 0) {
          return res.json({
            status: "success",
            msg: "found videos",
            data: { document },
          });
        } else {
          return res.json({
            status: "success",
            msg: "No Videos Recorded",
            data: {},
          });
        }
      } else throw new Error("error");
    } catch (error) {
      console.log(error);
      return res.json({
        status: "error",
        msg: `Internal server error`,
        data: {},
      });
    }
  });
};
