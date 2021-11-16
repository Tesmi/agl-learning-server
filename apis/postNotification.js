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
          broadcastNotification(dataToBeUploaded);
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
  async function broadcastNotification(data) {
    if (data.Board == "Everyone" && data.ClassData == "Everyone") {
      await client
        .db("main")
        .collection("users")
        .find({ AccountType: "student" })
        .toArray()
        .then((accounts) => {
          sendEachNotification(accounts, data);
        });
    } else if (data.Board == "Everyone") {
      await client
        .db("main")
        .collection("users")
        .find({ AccountType: "student", Grade: data.ClassData.toString() })
        .toArray()
        .then((accounts) => {
          sendEachNotification(accounts, data);
        });
    } else if (data.ClassData == "Everyone") {
      await client
        .db("main")
        .collection("users")
        .find({ AccountType: "student", Board: data.Board })
        .toArray()
        .then((accounts) => {
          sendEachNotification(accounts, data);
        });
    } else {
      await client
        .db("main")
        .collection("users")
        .find({
          AccountType: "student",
          Grade: data.ClassData.toString(),
          Board: data.Board,
        })
        .toArray()
        .then((accounts) => {
          sendEachNotification(accounts, data);
        });
    }
    async function sendEachNotification(accounts, data) {
      let msg = `<!DOCTYPE html>
      <html lang="en">
      <body>
          <p><b>${data.Subject}</b> </p>
          <p>
              ${data.Description}
          </p>
          <p>From @${data.By},</p>
          <p><b>AGL Learning App</b></p>
      </body>
      </html>`;
      let sub = "Notification from AGL App";

      accounts.forEach((account) => {
        let email = account.Email;
        axios.get("https://aglofficial.com/public/sendEmail", {
          params: { email, msg, sub },
        });
      });
    }
  }
};
