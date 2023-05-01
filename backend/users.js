const mongoose = require('mongoose')

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  desc: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  }
})

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  tasks: {
    type: [TaskSchema],
    default: []
  }
})

module.exports = User = mongoose.model('user', UserSchema);