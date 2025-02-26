const express = require("express");
const dotenv = require("dotenv");
const tRoutes = require("./routes/T-Routes")

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api", tRoutes)

app.get("/", (req, res) => {
    res.send("TSync API running...");
});

app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));