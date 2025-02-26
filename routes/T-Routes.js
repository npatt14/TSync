const express = require("express");
const router = express.Router();

// in memory store for tasks 
let tasks = [];
let subscribers = [];

router.get("/tasks", async (req, res, next) => {
    try {
        const redisClient = req.redisClient
        const cachedTasks = await redisClient.get("tasks");

        if (cacheTasks) {
            return res.json(JSON.parse(cachedTasks)); // return cached dataaaa
        }

        res.json(tasks);
        await redisClient.setEx("tasks", 60, JSON.stringify(tasks)); // cache for 60 sec
    } catch(error) {
        next(error);
    }
});

router.post("/tasks", async (req, res, next) => {
    try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: "title is required :D" });

    const newTask = { id: Date.now(), title, description, completed: false }; 
    tasks.push(newTask);

    // notify long polling subscribers
    subscribers.forEach((res) => res.json(newTask));
    subscribers = [];

    await req.redisClient.del("tasks");

    res.status(201).json(newTask)
    } catch(error) {
        next(error);
    }
}); 

router.put("/tasks/:id", async (req, res, next) => {
    try {
    const { id } = req.params;
    const { completed } = req.body;

    const task = tasks.find((t) => t.id == id);
    if (!task) return res.status(404).json({ error:"Task not found" });

    task.completed = completed !== undefined ? completed : task.completed;

    await req.redisClient.del("tasks"); // clear cache

    res.json(task);
    } catch (error) {
        next(error);
    }
});

router.delete("/tasks/:id", async (req, res, next) => {
    try {
    const { id } = req.params;
    tasks = tasks.filter((t) => t.id != id);

    await req.redisClient.del("tasks");

    res.status(200).json({ message: "Task deleted :D" });
    } catch(error) {
        next(error);
    }
});

// long polling for real time updates
router.get("/tasks/updates", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    subscribers.push(res);

    req.on("close", () => {
        subscribers = subscribers.filter((sub) => sub !== res);
    });
});

module.exports = router;