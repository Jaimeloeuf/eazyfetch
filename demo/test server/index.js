const express = require("express");
const app = express();

app.all("*", express.json(), function (req, res) {
  const { url, method: httpMethod, headers, body: bodyData } = req;

  res.status(200).json({
    ok: true,
    data: {
      url,
      httpMethod,
      headers,
      bodyData,
    },
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server up on: ${port}`));
