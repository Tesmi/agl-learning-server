module.exports = async (app, client) => {
  app.post("/api/scheduleClass", async (req, res) => {

    try {
      const user = req.user.name;
      const accountType = req.user.account;

      if (accountType != "teacher") {
        return res.json({
          status: "error",
          msg: `Unauthorised Access`,
          data: {},
        });
      }

      const lectureName = req.body.lectureName;
      const board = req.body.board;
      const classData = req.body.classData;
      const date = req.body.date;
      const endDate = req.body.endDate;

      if (!lectureName || !board || !classData || !date || !endDate) {
        return res.json({
          status: "error",
          msg: `Invalid request`,
          data: {},
        });
      }

      const dataToBeUploaded = {
        LectureName: lectureName,
        Board: board,
        ClassData: classData,
        Start: date.toString(),
        End: endDate.toString(),
      };

      let userdata = await client
        .db("main")
        .collection("users")
        .findOne({ UserName: user });
      if (userdata) {
        let name;
        if (userdata.Gender == "male") {
          name = "Mr. " + userdata.FullName;
        } else {
          name = "Ms. " + userdata.FullName;
        }

        dataToBeUploaded.By = name;
        dataToBeUploaded.URL =
          "https://jitsi.aglofficial.com/" +
          Math.random().toString(36).slice(2);
        dataToBeUploaded.UserName = userdata.UserName;

        client
          .db("main")
          .collection("classes")
          .insertOne(dataToBeUploaded)
          .then((e) => {
            return res.json({
              status: "success",
              msg: `Class scheduled successfully`,
              data: {},
            });
          })
          .catch((err) => {
            return res.json({
              status: "error",
              msg: `Unexpected error`,
              data: {},
            });
          });
      } else {
        return res.json({
          status: "error",
          msg: `Unexpected error`,
          data: {},
        });
      }
    } catch (error) {
      return res.json({
        status: "error",
        msg: `Unexpected error`,
        data: {},
      });
    }
  });
};
