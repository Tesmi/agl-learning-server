const axios = require("axios");

module.exports = async (app, client) => {
  app.post("/api/postNotification", async (req, res) => {
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

      const subject = req.body.subject;
      const board = req.body.board;
      const classData = req.body.classData;
      const desc = req.body.desc;

      if (!subject || !board || !classData || !desc) {
        return res.json({
          status: "error",
          msg: `Invalid request`,
          data: {},
        });
      }

      const dataToBeUploaded = {
        Subject: subject,
        Board: board,
        ClassData: classData,
        Description: desc,
        By: "",
      };

      dataToBeUploaded.By = user;

      client
        .db("main")
        .collection("notifications")
        .insertOne(dataToBeUploaded)
        .then((e) => {
          return res.json({
            status: "success",
            msg: `Notification posted successfully`,
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
    } catch (error) {
      return res.json({
        status: "error",
        msg: `Server error`,
        data: {},
      });
    }
  });
};
