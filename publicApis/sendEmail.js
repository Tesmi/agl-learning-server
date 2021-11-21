const nodemailer = require("nodemailer");
const config = require("../config");

module.exports = async (app) => {
  app.get("/public/sendEmail", async (req, res) => {
    const clientEmail = req.query.email;
    const msg = req.query.msg;
    const sub = req.query.sub;

    if (clientEmail && msg && sub) {
      let mailTransporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: config.email,
          pass: config.password,
        },
        pool: true,
        maxMessages: 10000,
      });

      let mailDetails = {
        from: config.email,
        to: clientEmail,
        subject: sub,
        html: msg,
      };

      mailTransporter.sendMail(mailDetails, function (err, data) {});

      return res.json({
        status: "success",
        msg: "otp sent successfully.",
        data: {},
      });
    }
    return res.json({
      status: "error",
      msg: "Invalid Request.",
      data: {},
    });
  });
};
