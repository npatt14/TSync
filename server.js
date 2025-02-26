const express = require("express");
const dotenv = require("dotenv");
const cluster = require("cluster");
const os = require("os");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit")
const redis = require("redis");
const tRoutes = require("./routes/T-Routes")
const errorHandler = require("./middleware/errorHandler");

dotenv.config();
const PORT = process.env.PORT || 3000;
const numCPUs = os.cpus().length;
if (cluster.isMaster) {
    console.log(`Master process ${process.pid} is running`);

    // fork workers for each cpu core
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on("exit", (worker) => {
        console.log(`Worker ${worker.process.pid} died, forking a new one :D`);
        cluster.fork();
    });
} else {
    const app = express();

    // security headers
    app.use(helmet());

    // rate limiting - max 100 reqs per 10 min
    const limiter = rateLimit({
        windowMs: 10 * 60 * 1000,
        max: 100, 
        message: { error: "Too many reqs, please try again later :D" },
    });
    app.use(limiter);

    // redis client setup
    const redisClient = redis.createClient();
    redisClient.connect().catch(console.error);

    app.use(express.json());
    app.use((req, res, next) => {
        req.redisClient = redisClient; // attach redis to req
    })
}



app.use(express.json());
app.use("/api", tRoutes)
app.use(errorHandler);

app.get("/", (req, res) => {
    res.send("TSync API running...");
});

app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));