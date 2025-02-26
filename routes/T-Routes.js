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

router.put("/tasks/:id", (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;

    const task = tasks.find((t) => t.id == id);
    if (!task) return res.status(404).json({ error:"Task not found" });

    task.completed = completed !== undefined ? completed : task.completed;

    res.json(task);
});

router.delete("/tasks/:id", (req, res) => {
    const { id } = req.params;
    tasks = tasks.filter((t) => t.id != id);

    res.status(200).json({ message: "Task deleted :D" });
});

// long polling for real time updates
router.get("/tasks/updates", (req, res) => {
    subscribers.push(res);
})

module.exports = router;