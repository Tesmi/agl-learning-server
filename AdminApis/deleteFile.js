const dropboxV2Api = require("dropbox-v2-api");
const config = require("../config");

module.exports = async (app, client) => {
  app.get("/admin/deleteFile", async (req, res) => {
    const fileUrl = req.query.name;

    if (!fileUrl) {
      return res.json({
        status: "error",
        msg: `Invalid file name`,
        data: {},
      });
    }
    if (fileUrl.toString().trim() == "") {
      return res.json({
        status: "error",
        msg: `File name is empty`,
        data: {},
      });
    }

    try {
      const dropbox = dropboxV2Api.authenticate({
        token: config.DROPBOX_TOKEN,
      });

      dropbox(
        {
          resource: "files/delete",
          parameters: {
            path: fileUrl,
          },
        },
        (err, result, response) => {
          if (err) {
            return res.json({
              status: "error",
              msg: `File name is empty`,
              data: {},
            });
          }

          try {
            client
              .db("main")
              .collection("files")
              .deleteOne({ DownloadDir: fileUrl })
              .then((e) => {
                return res.json({
                  status: "success",
                  msg: `File deleted successfully`,
                  data: {},
                });
              })
              .catch((err) => {
                return res.json({
                  status: "error",
                  msg: `Server error`,
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
        }
      );
    } catch (error) {
      return res.json({
        status: "error",
        msg: `Server error`,
        data: {},
      });
    }
  });
};
