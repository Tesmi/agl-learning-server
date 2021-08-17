module.exports = async (app, client) => {
  app.get("/api/dashboardData", async (req, res) => {

    const user = req.user.name;
    const moderators = 4;

    try {
      let db = client.db("main").collection("users");
      let db_classes = client.db("main").collection("classes");
      let userData = await db.findOne({ UserName: user });
      let totalTeachers = await db.countDocuments({ AccountType: "teacher" });
      let totalStudents = await db.countDocuments({ AccountType: "student" });

      if (!userData) {
        throw new Error("error");
      }

      let dashboardData = {
        fullName: userData.FullName,
        totalStudents,
        totalTeachers,
        moderators,
        currentClasses: null,
      };

      let currentIndianTime = Date.now(); // 5.5 hours ahead of utc
      currentIndianTime = currentIndianTime.toString();

      if (userData.AccountType == "student") {
        let currentClasses = await db_classes
          .find({
            $or: [{ Board: userData.Board }, { Board: "Everyone" }],
            $or: [{ ClassData: userData.Grade }, { ClassData: "Everyone" }],
            End: { $gt: currentIndianTime },
            Start: { $lt: currentIndianTime },
          })
          .toArray();

        if (currentClasses.length > 0) {
          dashboardData.currentClasses = currentClasses;
        }
      } else {
        let currentClasses = await db_classes
          .find({
            UserName: user,
            End: { $gt: currentIndianTime },
            Start: { $lt: currentIndianTime },
          })
          .toArray();


        if (currentClasses.length > 0) {
          dashboardData.currentClasses = currentClasses;
        }
      }


      return res.json({
        status: "success",
        msg: "data fetched",
        data: { dashboardData },
      });
    } catch (error) {
      return res.json({
        status: "error",
        msg: "Internal server error",
        data: {},
      });
    }
  });
};
