const express = require("express");
const cors = require("cors");
const { config } = require("dotenv");
const { connectDB } = require("./config/db");
const authRoutes = require("./routes/auth.routes");

config();
const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 5000

// Routes
// app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server Sucessfully Started on ${port}`)
})
