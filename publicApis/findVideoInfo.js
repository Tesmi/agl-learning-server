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
                VideoName: Array.from(Array(30), () =>
                  Math.floor(Math.random() * 36).toString(36)
                ).join(""),
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
                    "INVALID_",
                    Array.from(Array(30), () =>
                      Math.floor(Math.random() * 36).toString(36)
                    ).join("")
                  );
                });
            })
            .catch((err) => {
              return res.send(
                "INVALID_",
                Array.from(Array(30), () =>
                  Math.floor(Math.random() * 36).toString(36)
                ).join("")
              );
            });
        } else
          return res.send(
            "INVALID_",
            Array.from(Array(30), () =>
              Math.floor(Math.random() * 36).toString(36)
            ).join("")
          );
      })
      .catch((err) => {
        return res.send(
          "INVALID_",
          Array.from(Array(30), () =>
            Math.floor(Math.random() * 36).toString(36)
          ).join("")
        );
      });
  });
};
