module.exports = async (app, client) => {
  app.get("/public/vidInfo", async (req, res) => {
    let StreamName = req.query.name;
    if (StreamName) StreamName = StreamName.slice(1, -1);

    const BaseURL = "https://jitsi.aglofficial.com/";

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
            .findOne({})
            .then((userData) => {
              return res.send(
                `_${vidData.LectureName}_${vidData.Board}_${vidData.ClassData}_${userData.FullName}`
              );
            })
            .catch((err) => {
              return res.send("_N/A_Everyone_Everyone_N/A");
            });
        } else return res.send("_N/A_Everyone_Everyone_N/A");
      })
      .catch((err) => {
        return res.send("_N/A_Everyone_Everyone_N/A");
      });
  });
};
