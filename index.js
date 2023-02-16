const express = require("express");
const app = express();
const cors = require("cors");
const { urlencoded } = require("express");
require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI, () => {
  console.log("connected to mongoDB successfully");
});

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
    },
  },
  {
    versionKey: false,
  }
);

const exerciseSchema = mongoose.Schema({
    username: String,
    description: String,
    duration: Number,
    date: String,
    userId: String,
});

const User = mongoose.model("User", userSchema);
const Exercise = mongoose.model("Exercise", exerciseSchema);

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

//Get /api/users

app.get("/api/users", async (req, res) => {
  const users = await User.find();
  res.send(users);
});

//POST /api/users username

app.post("/api/users", async (req, res) => {
  const username = req.body.username;
  const foundUser = await User.findOne({ username });

  if (foundUser) {
    res.json(foundUser);
  }

  const user = await User.create({
    username,
  });
  res.json(user);
});

app.post("/api/users/:id/exercises", async (req, res) => {
  let { description, duration, date } = req.body;
  const userId = req.body[":_id"];
  const foundUser = await User.findById(userId);

  if (!foundUser) {
    res.send({ message: "no such user" });
  }

  if (!date) {
    date = new Date();
  } else {
    date = new Date(date);
  }

  // username: String,
  // description: String,
  // duration: Number,
  // date: String,
  // userId: String,

  await Exercise.create({
    username: foundUser.username,
    description,
    duration: Number(duration),
    date: date.toDateString(),
    userId,
  });

  res.send({
    username: foundUser.username,
    description,
    duration: Number(duration),
    date: date.toDateString(),
    _id: userId,
  });
});

app.get('/api/users/:userId/exercises', async function(req, res) {
  const userExercises = await Exercise.findOne({ userId: req.params.userId })
  res.send(userExercises)
})

app.get('/api/users/:userId/logs', async function(req, res) {
  const userId = req.params.userId
  const foundUser = await User.findById(userId);

  if (!foundUser) {
    res.send({ message: "no such user" });
  }
  let exercises = await Exercise.find({ userId }) 
  exercises = exercises.map((exercise) => {
    return {
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date,
    }
  })

  res.json({
    username: foundUser.username,
    count: exercises.length,
    _id: userId,
    log: exercises
  })

})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
