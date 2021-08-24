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
require("./publicApis/sendOtp")(app);

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
  res.json("test");
});

app.listen(5000, () => console.log("server started"));
