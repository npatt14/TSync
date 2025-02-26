const express = require("express");
const dotenv = require("dotenv");
const tRoutes = require("./routes/T-Routes")
const errorHandler = require("./middleware/errorHandler");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api", tRoutes)
app.use(errorHandler);

app.get("/", (req, res) => {
    res.send("TSync API running...");
});

app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));