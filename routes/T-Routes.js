const express = require("express");
const router = express.Router();

// in memory store for tasks 
let tasks = [];
let subscribers = [];

router.get("/tasks", (req, res) => {
    res.json(tasks);
});

router.post("/tasks", (req, res) => {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: "title is required :D" });

    const newTask = { id: Date.now(), title, description, completed: false }; 
    tasks.push(newTask);

    // notify long polling subscribers
    subscribers.forEach((res) => res.json(newTask));
    subscribers = [];

    res.status(201).json(newTask)
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