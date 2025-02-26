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

})