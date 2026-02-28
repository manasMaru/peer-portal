const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const grievanceRoutes = require("./routes/grievanceRoutes");
const replyRoutes = require("./routes/replyRoutes");
const resourceRoutes = require("./routes/resourceRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/grievances", grievanceRoutes);
app.use("/api/replies", replyRoutes);
app.use("/api/resources", resourceRoutes);

app.get("/", (req, res) => {
  res.send("Peer Portal Backend Running");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});