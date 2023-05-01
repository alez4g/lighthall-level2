const express = require('express')
const app = express()
const port = 3000
const path = require('path');
const cors = require('cors');
app.use(cors());
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const connectDB = require('./config/db')
connectDB();
const User = require('./users.js')
const mongoose = require('mongoose')

// Render Html File
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'templates/index.html')); //edit to link to react index.html after finishing frontend
});

app.listen(port, () => {
  console.log(`Hello from ${port}! :)`)
})

//---------------------main app--------------------
app.post('/createTask', async (req, res) => {
  const { title, desc, status, dueDate, user } = req.body.task;

  if(!title || !desc || !status || !dueDate || !user)
    return res.status(400).json({message: 'All fields required.'})

  try{
    let userObj = await User.findOne({username: user});
    if (!userObj){
      userObj = new User({username: user});
      await userObj.save();
    }

    userObj.tasks.push({ title, desc, status, dueDate });
    await userObj.save();

  return res.status(201).json({message: 'Task created successfully.', createdTask: userObj.tasks[userObj.tasks.length - 1]})
  } catch(err) {
    console.log(err);
    return res.status(500).json({message: "Something went wrong."});
  }
});

app.post('/editTask', async (req, res) => {
  const id = req.body.id;
  const { title, desc, status, dueDate, user } = req.body.task;

  if(!id || !title || !desc || !status || !dueDate || !user)
    return res.status(400).json({message: 'All fields required.'})

  try {
    let userObj = await User.findOne({username: user});
    if (!userObj){
      return res.status(404).json({message: 'User not found.'});
    }
    const task = userObj.tasks.find(task => task._id.toString() === id)
    if (!task){
      return res.status(404).json({message: 'Task not found.'});
    }

    task.set({title, desc, status, dueDate});
    await userObj.save();
  return res.status(200).json({ message: 'Task updated successfully.', updatedTask: task });
  } catch(err) {
    console.log(err);
    return res.status(500).json({message: "Something went wrong."});
  }

});

app.post('/deleteTask', async (req,res) => {
  const id = req.body.id;
  const {user} = req.body;

  if(!id || !user)
    return res.status(400).json({message: "All fields required."});

  try{
    const userObj = await User.findOne({username: user});
    if (!userObj){
      return res.status(404).json({message: "User not found."});
    }
    const task = userObj.tasks.find(task => task._id.toString() === id);
    if (!task){
      return res.status(404).json({message: 'Task not found.'});
    }

    userObj.tasks.pull(task);
    await userObj.save();
  return res.status(200).json({ message: 'Task deleted successfully.', deletedTask: task });
  } catch(err){
    console.log(err);
    return res.status(500).json({message: "Something went wrong."})
  }

});

app.get('/getAllTasks', async (req, res) => {
  try{
    const users = await User.find();
    let tasks = [];

    users.forEach(user=>{
      user.tasks.forEach(task=>{
        const taskObj = task.toObject();
        taskObj.user = user.username;
        tasks.push(taskObj);
      })
    })
    return res.status(200).json(tasks);
  } catch(err){
    console.log(err);
    return res.status(500).json({message:"Server error."});
  }
});

app.get('/getUserTasks', async (req, res) => {
  const {user} = req.query;
  try{
    const userObj = await User.findOne({username: user});
    if (!userObj){
      return res.status(200).json({});
    }
    
    const userTasks = userObj.tasks;
    res.status(200).json(userTasks);
  } catch(err){
    console.log(err);
    return res.status(500).json({message:"Server error."});
  }
})