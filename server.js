const express = require("express");
const app = express();
const cors = require("cors");
const cron = require("node-cron");

app.use(express.static("public"));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

const config = require("./config");

//settingn up MongoDB
const MongoClient = require("mongodb").MongoClient;
const uri = config.db_uri;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//connecting to mongodb
try {
  client.connect();
} catch (error) {
  console.log(`can't connect to the database ${error}`);
}

//setting up cron job
cron.schedule("*/30 * * * *", () => {
  deleteScheduledClasses();
});

//importing middlewares
const authenticateAdmin = require("./middlewares/authenticateAdmid");
const authenticateUser = require("./middlewares/authenticateUser");

//using middlewares
app.use("/admin", authenticateAdmin);
app.use("/api", authenticateUser);

//importing admin apis
require("./AdminApis/generateToken")(app, client);

//importing public apis
require("./publicApis/isKeyAvailable")(app, client);
require("./publicApis/registerUser")(app, client);
require("./publicApis/auth")(app, client);
require("./publicApis/sendEmail")(app);
require("./publicApis/findUserInfo")(app, client);
require("./publicApis/updatePassword")(app, client);
require("./publicApis/streamVideo")(app, client);
require("./publicApis/findVideoInfo")(app, client);

//importing private apis
require("./apis/uploadFile")(app, client);
require("./apis/getAllFiles_teacher")(app, client);
require("./apis/downloadFile")(app, client);
require("./apis/deleteFile")(app, client);
require("./apis/scheduleClass")(app, client);
require("./apis/getAllClassesData_teacher")(app, client);
require("./apis/deleteScheduleClass")(app, client);
require("./apis/postNotification")(app, client);
require("./apis/getAllNotifications_teacher")(app, client);
require("./apis/deleteNotification_teacher")(app, client);
require("./apis/getUserProfileInfo")(app, client);
require("./apis/updatePassword")(app, client);
require("./apis/deleteAccount")(app, client);
require("./apis/dashboardData")(app, client);
require("./apis/getAllFiles_student")(app, client);
require("./apis/getAllClassesData_student")(app, client);
require("./apis/getAllNotifications_student")(app, client);
require("./apis/updateProfile")(app, client);
require("./apis/drawerData")(app, client);
require("./apis/uploadRecycleContent")(app, client);
require("./apis/getRecycleData_teacher")(app, client);
require("./apis/deleteRecycleContent")(app, client);
require("./apis/getRecycleData_students")(app, client);
require("./apis/getAllRecordedVideos_Student")(app, client);
require("./apis/getAllRecordedVideos_Teacher")(app, client);

async function deleteScheduledClasses() {
  try {
    let currentUTCTime = Date.now();
    currentUTCTime = currentUTCTime.toString();
    await client
      .db("main")
      .collection("classes")
      .deleteMany({
        End: { $lt: currentUTCTime },
      });
  } catch (error) {}
}

app.get("/", async (req, res) => {
  res.json("404");
});

app.get("/terms_and_conditions", async (req, res) => {
  res.sendFile("./public/terms_and_conditions.html", { root: __dirname });
});

app.get("/privacy_policy", async (req, res) => {
  res.sendFile("./public/privacy_policy.html", { root: __dirname });
});

app.listen(5000, () => console.log("server started"));
