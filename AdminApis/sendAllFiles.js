module.exports = async (app, client) => {
    app.get("/admin/sendAllFiles", async (req, res) => {
      let files = await client
        .db("main")
        .collection("files")
        .find({})
        .toArray();
  
      if (files.length > 0) {
        return res.json({
          status: "success",
          msg: "found some data",
          data: { files },
        });
      } else {
        return res.json({
          status: "success",
          msg: "data not found",
          data: { files: {} },
        });
      }
    });
  };
  