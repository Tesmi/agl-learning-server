const crypto = require("crypto");
const childProc = require("child_process");

module.exports = async (app, client) => {
  app.post("/public/registerUser", async (req, res) => {
    try {
      const generalData = {
        fullname: req.body.fullname,
        email: req.body.email,
        contact: req.body.contact,
        gender: req.body.gender,
        accountType: req.body.accountType,
        password: req.body.password,
      };

      const specificData = {
        grade: req.body.grade,
        board: req.body.board,
        teacherKey: req.body.teacherKey,
      };

      for (const [key, value] of Object.entries(generalData)) {
        if (!value) {
          return res.json({
            status: "error",
            msg: `Registration failed due to invalid ${key}`,
            data: {},
          });
        }

        if (value.trim() == "") {
          return res.json({
            status: "error",
            msg: `Registration failed due to invalid ${key}`,
            data: {},
          });
        }
      }

      //check if email already exist
      let emailAlreadyExist = await client
        .db("main")
        .collection("users")
        .findOne({ Email: generalData.email.trim() });

      if (emailAlreadyExist) {
        return res.json({
          status: "error",
          msg: "Email already exist.",
          data: {},
        });
      }

      const salt = generateSalt();
      let hashedPassword;
      try {
        hashedPassword = crypto
          .createHash("sha512")
          .update(generalData.password.concat(salt))
          .digest("hex");
      } catch (error) {
        throw new Error("Invalid Password");
      }

      const uuid = await generateUniqueUsername(generalData.fullname, client);
      if (uuid == "error") {
        throw new Error("Unable to create user!");
      }

      const dateInIST = Date.now() + 19800000; // 5.5 hours ahead of utc

      let dataToBeStored = {
        FullName: toTitleCase(generalData.fullname),
        UserName: uuid,
        Email: generalData.email.trim().toLowerCase(),
        Contact: generalData.contact.trim(),
        Gender: generalData.gender.trim(),
        AccountType: generalData.accountType.trim(),
        Password: hashedPassword,
        Salt: salt,
        CreatedOn: dateInIST,
      };

      if (generalData.accountType == "teacher") {
        if (!specificData.teacherKey) {
          return res.json({
            status: "error",
            msg: "Teacher's key is invalid",
            data: {},
          });
        }
        //check if key is valid
        let isTokenValid = await client
          .db("main")
          .collection("tokens")
          .findOne({ token: specificData.teacherKey.trim(), Status: "Unused" });

        if (isTokenValid) {
          dataToBeStored.Key = specificData.teacherKey.trim();
          let result = await client
            .db("main")
            .collection("users")
            .insertOne(dataToBeStored);

          if (result) {
            await updateKey(
              specificData.teacherKey.trim(),
              dateInIST,
              uuid,
              client
            );

            res.json({
              status: "success",
              msg: `Registration is successfull`,
              data: { username: uuid },
            });

            childProc.exec(
              `sudo prosodyctl register ${uuid} jitsi.aglofficial.com ${generalData.password}`
            );
            return;
          } else {
            return res.json({
              status: "error",
              msg: "Teacher's key is invalid",
              data: {},
            });
          }
        } else throw new Error("Token is invalid");
      } else if (generalData.accountType == "student") {
        if (!specificData.board || !specificData.grade) {
          return res.json({
            status: "error",
            msg: `Registration failed due to invalid grade or board!`,
            data: {},
          });
        }

        if (specificData.board.trim() == "" || specificData.grade == "") {
          return res.json({
            status: "error",
            msg: `Registration failed due to invalid grade or board!`,
            data: {},
          });
        }

        dataToBeStored.Board = specificData.board;
        dataToBeStored.Grade = specificData.grade;

        let result = await client
          .db("main")
          .collection("users")
          .insertOne(dataToBeStored);

        if (result) {
          return res.json({
            status: "success",
            msg: `Registration is successfull`,
            data: { username: uuid },
          });
        } else {
          throw new Error("Something went wrong");
        }
      } else {
        return res.json({
          status: "error",
          msg: `Registration failed due to invalid account type`,
          data: {},
        });
      }
    } catch (error) {
      return res.json({
        status: "error",
        msg: "Internal server error, try again later.",
        data: {},
      });
    }
  });
};

async function updateKey(key, date, user, client) {
  await client
    .db("main")
    .collection("tokens")
    .updateOne(
      { token: key },
      { $set: { Status: "Used", UsedBy: user, UsedDate: date } }
    )
    .then((e) => {
      return "done";
    })
    .catch((err) => {
      return "error";
    });
}

function generateSalt() {
  let length = 20;
  let string = "abcdefghijklmnopqrstuvwxyz"; //to upper
  let numeric = "0123456789";
  let punctuation = "!@#$%^&*()_+~`|}{[]:;?><,./-=";
  let password = "";
  let character = "";
  while (password.length < length) {
    entity1 = Math.ceil(string.length * Math.random() * Math.random());
    entity2 = Math.ceil(numeric.length * Math.random() * Math.random());
    entity3 = Math.ceil(punctuation.length * Math.random() * Math.random());
    hold = string.charAt(entity1);
    hold = entity1 % 2 == 0 ? hold.toUpperCase() : hold;
    character += hold;
    character += numeric.charAt(entity2);
    character += punctuation.charAt(entity3);
    password = character;
  }
  return password;
}

async function generateUniqueUsername(fullname, client) {
  let x = 0;
  while (x < 5) {
    let randNum = Math.floor(10 + Math.random() * 90);
    let name = fullname.split(" ")[0].toUpperCase();

    let username = name + randNum;
    let result = await client
      .db("main")
      .collection("users")
      .countDocuments({ UserName: username });

    if (result == 0) {
      return username;
    }
    x++;
  }
  return "error";
}

function toTitleCase(phrase) {
  return phrase
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
