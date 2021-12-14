var admin = require("firebase-admin");

var serviceAccount = require("../agl-learning-app-7a675-firebase-adminsdk-qe4gx-c6e38c8b46.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

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
          sendInAppNotifications(dataToBeUploaded);
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
  async function sendInAppNotifications(data) {
    let fcm_tokens = [];

    let users = await client
      .db("main")
      .collection("loginTokens")
      .find()
      .toArray();
    if (users.length > 0) {
      for (let i = 0; i < users.length; ++i) {
        if (users[i].FCM) fcm_tokens.push(users[i].FCM);
      }
    }

    let payload = {
      notification: {
        title: data.Subject,
        body: data.By + ": " + data.Description,
        sound: "default",
        badge: "1",
      },
    };

    let notificationOptions = {
      priority: "high",
    };

    admin
      .messaging()
      .sendToDevice(fcm_tokens, payload, notificationOptions)
      .then(function (response) {})
      .catch(function (error) {});
  }
};
