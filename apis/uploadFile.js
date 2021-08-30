const dropboxV2Api = require("dropbox-v2-api");
const config = require("../config");
const fs = require("fs");
const multer = require("multer");
const upload = multer({ dest: "./uploads/" });

module.exports = async (app, client) => {
  app.post(
    "/api/uploadFile",
    upload.single("fileData"),
    async (req, res, next) => {
      if (req.user.account != "teacher") {
        return res.json({
          status: "error",
          msg: `Unauthorised Access`,
          data: {},
        });
      }

      fs.readFile(req.file.path, async (err, contents) => {
        if (err) {
          console.log(err);
          return res.json({
            status: "error",
            msg: `Internal server error`,
            data: {},
          });
        } else {
          try {
            let user = req.user.name;
            let filename = req.body.name;
            let filenameHashed = req.file.filename;
            let board = req.body.board;
            let classname = req.body.classname;
            let description = req.body.description;

            const dropbox = dropboxV2Api.authenticate({
              token: config.DROPBOX_TOKEN,
            });

            await dropbox(
              {
                resource: "files/upload",
                parameters: {
                  path: "/files/" + filenameHashed + ".pdf",
                },
                readStream: fs.createReadStream(req.file.path),
              },
              (err, result, response) => {
                if (err) {
                  console.log(err);
                  //unline the file
                  fs.unlink(req.file.path, (err) => {
                    //todo handle this error
                  });

                  return res.json({
                    status: "error",
                    msg: `Network error`,
                    data: {},
                  });
                }

                client
                  .db("main")
                  .collection("files")
                  .insertOne({
                    CreatedBy: user,
                    FileName: filename,
                    FileNameHashed: filenameHashed,
                    Board: board,
                    ClassName: classname,
                    Description: description,
                    DownloadDir: result.path_lower,
                    Date: Date.now() + 19800000,
                  })
                  .then((e) => {
                    //unline the file
                    fs.unlink(req.file.path, (err) => {
                      //todo handle this error
                    });

                    return res.json({
                      status: "success",
                      msg: `File uploaded Successfully`,
                      data: {},
                    });
                    //send response to client
                  })
                  .catch((err) => {
                    console.log(err);
                    return res.json({
                      status: "error",
                      msg: `Internal server error`,
                      data: {},
                    });
                  });
              }
            );
          } catch (error) {
            console.log(error);
            return res.json({
              status: "error",
              msg: `Invalid arguments`,
              data: {},
            });
          }
        }
      });
    }
  );
};
