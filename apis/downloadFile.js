const fs = require("fs");
const dropboxV2Api = require("dropbox-v2-api");
const config = require("../config");

module.exports = async (app, client) => {
  app.get("/api/downloadFile", (req, res) => {
    const downloadUrl = req.query.downloadUrl;
    const randumNum = Math.floor(100000 + Math.random() * 900000);

    if (!downloadUrl) {
      return res.status(404).end();
    }
    if (downloadUrl.toString().trim() == "") {
      return res.status(404).end();
    }

    try {
      const dropbox = dropboxV2Api.authenticate({
        token: config.DROPBOX_TOKEN,
      });

      const filename =
        downloadUrl.split("/")[downloadUrl.split("/").length - 1];

      dropbox(
        {
          resource: "files/download",
          parameters: {
            path: downloadUrl,
          },
        },
        (err, result, response) => {
          if (err) {
            return res.status(404).end();
          }

          return res.download(
            "downloads/" + randumNum + filename,
            function (error) {
              if (error) {
                return res.status(404).end();
              }
            }
          );
        }
      ).pipe(fs.createWriteStream("downloads/" + randumNum + filename));
    } catch (error) {
      return res.status(404).end();
    } finally {
      setTimeout(() => {
        try {
          const path = "downloads/";
          const filename =
            downloadUrl.split("/")[downloadUrl.split("/").length - 1];
          fs.unlink(path + randumNum + filename, (err) => {
            //todo handle error
          });
        } catch (error) {}
      }, 300000);
    }
  });
};
