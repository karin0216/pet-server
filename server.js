const express = require("express");
const Socket = require("socket.io");
const cors = require("cors");
require("./db");
const morgan = require("morgan");

const app = express();
app.use(cors());

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
const port = process.env.PORT || 4000;
app.use(morgan("dev"));
app.use(cors());

app.use("/auth", require("./routes/auth"));
app.use("/user", require("./routes/user"));
app.use("/pet", require("./routes/pet"));
app.use("/pics", require("./routes/upload"));
app.use("/requests", require("./routes/request"));
app.use("/tag", require("./routes/tag"));
app.use("/messages", require("./routes/message"));

app.get("/test", async (req, res) => {
  res.send("test");
});

const server = app.listen(port, () => {
  console.log(`listening to port ${port}`);
});

const io = Socket(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  require("./socket")(socket, io);
});
