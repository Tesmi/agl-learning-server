module.exports = async (app, client) => {
  app.post("/admin/generateTokens", async (req, res) => {
    try {
      const amount = req.body.amount;
      const data = [];

      if (amount && amount > 0 && amount <= 100) {
        for (let i = 0; i < amount; ++i) {
          data.push({
            token: createTokens(20),
            Status: "Unused",
            UsedBy: "N/A",
            UsedDate: "N/A",
          });
        }
        await client.db("main").collection("tokens").insertMany(data);
        return res.json({
          status: "done",
          msg: "created pins successfully",
          data: {},
        });
      }
      return res.json({
        status: "error",
        msg: "amount is invalid",
        data: {},
      });
    } catch (error) {
      return res.json({
        status: "error",
        msg: "Internal server error",
        data: {},
      });
    }
  });
};

function createTokens(amount) {
  amount = amount ? amount : 20;
  let token = "";
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let charactersLength = characters.length;
  for (let i = 0; i < amount; i++) {
    token += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return token;
}
