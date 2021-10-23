module.exports = async (app, client) => {
  app.post("/api/updateProfile", async (req, res) => {

    const user = req.user.name;
    const accountType = req.body.accountType;

    try {
      if (accountType == "teacher") {
        client
          .db("main")
          .collection("users")
          .updateOne(
            { UserName: user },
            {
              $set: {
                FullName: toTitleCase(req.body.fullName),
                Email: req.body.email,
                Contact: req.body.contact,
              },
            }
          )
          .then((e) => {
            return res.json({
              status: "success",
              msg: `Profile Updated`,
              data: {},
            });
          })
          .catch((err) => {
            return res.json({
              status: "error",
              msg: `Internal server error`,
              data: {},
            });
          });
      } else if (accountType == "student") {
        client
          .db("main")
          .collection("users")
          .updateOne(
            { UserName: user },
            {
              $set: {
                FullName: toTitleCase(req.body.fullName),
                Email: req.body.email,
                Contact: req.body.contact,
                Board: req.body.board,
                Grade: req.body.grade,
              },
            }
          )
          .then((e) => {
            return res.json({
              status: "success",
              msg: `Profile Updated`,
              data: {},
            });
          })
          .catch((err) => {
            return res.json({
              status: "error",
              msg: `Internal server error`,
              data: {},
            });
          });
      } else {
        return res.json({
          status: "error",
          msg: `Internal server error`,
          data: {},
        });
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

function toTitleCase(phrase) {
  return phrase
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
