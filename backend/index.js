const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// AI route
const aiRoutes = require("./routes/ai");
app.use("/ai", aiRoutes);

// test route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// start server
app.listen(process.env.PORT || 5000, () => {
  console.log("Server running");
});
