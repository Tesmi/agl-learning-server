module.exports = async (app, client) => {
  app.get("/api/drawerData", async (req, res) => {
    try {
      const user = req.user.name;
      const DB = client.db("main").collection("users");

      const totalTeachers = await DB.countDocuments({ AccountType: "teacher" });
      const totalStudents = await DB.countDocuments({ AccountType: "student" });

      const userData = await DB.findOne({
        UserName: user,
      });

      if (userData) {
        let drawerData = {
          teachers: totalTeachers,
          students: totalStudents,
          username: user,
          fullname: userData.FullName,
        };

        return res.json({
          status: "success",
          msg: "data fetched",
          data: { drawerData },
        });
      } else {
        throw new Error("No user found");
      }
    } catch (error) {
      return res.json({
        status: "error",
        msg: "Internal server error",
        data: {},
      });
    }
  });
};
