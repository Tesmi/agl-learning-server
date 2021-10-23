module.exports = async (app, client) => {
  app.get("/api/getAllNotificationsStudent", async (req, res) => {
    const user = req.user.name;

    try {
      let userData = await client
        .db("main")
        .collection("users")
        .findOne({ UserName: user });

      if (userData) {
        let notifications = await client
          .db("main")
          .collection("notifications")
          .find({
            $or: [{ ClassData: userData.Grade }, { ClassData: "Everyone" }],
            $or: [{ Board: userData.Board }, { Board: "Everyone" }],
          })
          .toArray();

        if (notifications.length > 0) {
          return res.json({
            status: "success",
            msg: `Notifications fetched`,
            data: { notifications },
          });
        } else {
          return res.json({
            status: "success",
            msg: `No notifications found.`,
            data: { notifications: null },
          });
        }
      } else {
        throw new Error("error");
      }
    } catch (error) {
      return res.json({
        status: "error",
        msg: `Internal server error`,
        data: {},
      });
    }
  });
};
