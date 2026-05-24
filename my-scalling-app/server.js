const express = require("express");
const { timeStamp } = require("node:console");
const app = express();
const PORT = process.env.PORT || 3000;

const INSTANCE_NAME = process.env.INSTANCE_NAME || "Unknown Server";

app.get("/", (req, res) => {
  console.log(`[LOG] Handling request on ${INSTANCE_NAME}`);
  res.json({
    message: "Hello from the MNZ system design",
    handled_by: INSTANCE_NAME,
    timeStamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`${INSTANCE_NAME} is spinning up on port ${PORT}...`);
});
