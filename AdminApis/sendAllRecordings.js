module.exports = async (app, client) => {
  app.get("/admin/sendAllRecordings", async (req, res) => {
    let videos = await client
      .db("main")
      .collection("recordedVideos")
      .find({})
      .toArray();

    if (videos.length > 0) {
      return res.json({
        status: "success",
        msg: "found some data",
        data: { videos },
      });
    } else {
      return res.json({
        status: "success",
        msg: "data not found",
        data: { videos: {} },
      });
    }
  });
};
