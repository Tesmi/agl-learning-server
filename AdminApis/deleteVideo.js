const fs = require("fs");

module.exports = async (app, client) => {
  app.get("/admin/deleteVideo", async (req, res) => {
    const VideoName = req.query.name;

    if (VideoName) {
      await client
        .db("main")
        .collection("recordedVideos")
        .deleteOne({ VideoName })
        .then((e) => {
          try {
            fs.stat(`./recordings/${VideoName}.mp4`, (err, stats) => {
              if (err) {
                return res.send("success");
              }

              fs.unlink(`./recordings/${VideoName}.mp4`, (err) => {
                if (err) {
                  return res.send("success");
                }
                return res.send("success");
              });
            });
          } catch (error) {
            return res.send("error");
          }
        })
        .catch((err) => {
          return res.send("error");
        });
    } else {
      res.send("error");
    }
  });
};
