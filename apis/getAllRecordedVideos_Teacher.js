const fs = require("fs");

module.exports = async (app, client) => {
  app.get("/api/getAllRecordedVideos_Teacher", async (req, res) => {
    const user = req.user.name;
    const accountType = req.user.account;

    if (accountType != "teacher") {
      return res.json({
        status: "error",
        msg: `Unauthorised Access`,
        data: {},
      });
    }

    client
      .db("main")
      .collection("recordedVideos")
      .find({ UserNameOfTeacher: user })
      .toArray((err, doc) => {
        if (err) {
          return res.json({
            status: "error",
            msg: `Internal server error`,
            data: {},
          });
        }

        for (let i = 0; i < doc.length; i++) {
          let vidName = doc[i].VideoName + ".mp4";
          let path = "./recordings/" + vidName;
          if (!fs.existsSync(path)) {
            doc.splice(
              doc.findIndex((a) => a.id === doc[i].VideoName),
              1
            );
          }
        }

        if (doc.length > 0) {
          return res.json({
            status: "success",
            msg: `found data`,
            data: { document: doc },
          });
        } else {
          return res.json({
            status: "success",
            msg: `no data found`,
            data: { document: null },
          });
        }
      });
  });
};
