module.exports = async (app, client) => {
  app.get("/public/vidInfo", async (req, res) => {
    let StreamName = req.query.name;
    const BaseURL = "https://jitsi.aglofficial.com/";
    if (StreamName) StreamName = StreamName.split("/")[3].split("_")[0];
    const fullVidURL = BaseURL + StreamName;

    client
      .db("main")
      .collection("classes")
      .findOne({ URL: fullVidURL })
      .then((vidData) => {
        if (vidData) {
          client
            .db("main")
            .collection("users")
            .findOne({ UserName: vidData.UserName })
            .then((userData) => {
              let data = {
                VideoName: Math.random().toString(36).slice(2),
                LectureName: vidData.LectureName,
                Board: vidData.Board,
                Class: vidData.ClassData,
                NameOfTeacher: userData.FullName,
              };
              //push data to database
              client
                .db("main")
                .collection("recordedVideos")
                .insertOne(data)
                .then((e) => {
                  return res.send(data.VideoName);
                })
                .catch((err) => {
                  return res.send(
                    "INVALID_" + Math.random().toString(36).slice(2)
                  );
                });
            })
            .catch((err) => {
              return res.send("INVALID_" + Math.random().toString(36).slice(2));
            });
        } else
          return res.send("INVALID_" + Math.random().toString(36).slice(2));
      })
      .catch((err) => {
        return res.send("INVALID_" + Math.random().toString(36).slice(2));
      });
  });
};
