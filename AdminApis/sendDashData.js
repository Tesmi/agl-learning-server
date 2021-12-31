const fs = require("fs");

module.exports = async (app, client) => {
  app.get("/admin/sendDashData", async (req, res) => {
    await client.db("main").command(
      {
        dbStats: 1,
        scale: 1024 * 1024,
      },
      async (err, data) => {
        let dbSize = 0;
        let fullSize = 0;
        if (!err) {
          dbSize = data.dataSize;
          fullSize = 512;
        }

        let totalTeachers = await client
          .db("main")
          .collection("users")
          .countDocuments({ AccountType: "teacher" });
        let totalStudents = await client
          .db("main")
          .collection("users")
          .countDocuments({ AccountType: "student" });

        let totalVideos = await client
          .db("main")
          .collection("recordedVideos")
          .find({})
          .toArray();

        if (totalVideos.length > 0) {
          let videosSize = 0;
          for (let i = 0; i < totalVideos.length; ++i) {
            let statsObj = fs.statSync(
              `./recordings/${totalVideos[i].VideoName}.mp4`
            );
            if (statsObj) videosSize += statsObj.size;
            videosSize = videosSize / 1024 / 1024;
          }
          let datatobesent = {
            dbSize: 2,
            fullSize,
            totalTeachers,
            totalStudents,
            videosSize,
          };
          return res.send({ stats: datatobesent });
        } else {
          let datatobesent = {
            dbSize: 2,
            fullSize,
            totalTeachers,
            totalStudents,
            videosSize: 0,
          };
          return res.send({ stats: datatobesent });
        }
      }
    );
  });
};
