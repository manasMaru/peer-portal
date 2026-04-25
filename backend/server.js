const express = require("express");
const cors = require("cors");

const requestRoutes = require("./routes/requestRoutes");// Go to file: ./routes/requestRoutes.js, Take whatever it exports, Store it in variable requestRoutes
const authRoutes = require("./routes/authRoutes");
const grievanceRoutes = require("./routes/grievanceRoutes");
const replyRoutes = require("./routes/replyRoutes");
const resourceRoutes = require("./routes/resourceRoutes");

const app = express();//creates an Express application (server instance)

app.use(cors());//It enables (Cross-Origin Resource Sharing), our frontend (running on a different port/domain) to talk to our backend
app.use(express.json());//Convert incoming JSON data into JavaScript objects

app.use("/api/auth", authRoutes);
app.use("/api/grievances", grievanceRoutes);
app.use("/api/replies", replyRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/requests", requestRoutes);

app.get("/", (req, res) => {
  res.send("Peer Portal Backend Running");
});

//FIX FOR DEPLOYMENT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});