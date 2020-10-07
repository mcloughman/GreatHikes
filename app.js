const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const axios = require("axios");

// APP CONFIG
const app = express();
mongoose
  .connect("mongodb://localhost:27017/birdproject", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));

// MONGOOSE MODEL CONFIG
var birdSchema = new mongoose.Schema({
  name: String,
  image: String,
  description: String,
  created: { type: Date, default: Date.now },
});

var Bird = mongoose.model("Bird", birdSchema);

// ROUTES
// INDEX
app.get("/", () => {
  res.redirect("/blogs");
});

app.get("/birds", async (req, res) => {
  try {
    let foundBirds = await Bird.find({});
    res.render("index", { birds: foundBirds });
  } catch (err) {
    console.log(err);
  }
});

// NEW renders a form
app.get("/birds/new", (req, res) => {
  res.render("new");
});

// CREATE
app.post("/birds", async (req, res) => {
  try {
    let newBird = await Bird.create(req.body.bird);
    res.redirect("/birds");
  } catch (err) {
    console.log(err);
  }
});

// SHOW
app.get("/birds/:id", async(req, res) => {
  try {
    let foundBird = await Bird.findById(req.params.id);
    res.render("show", {bird: foundBird});
    if (!foundBird) {
      throw ("OOPS! NO BIRD")
    }
  } catch(err) {
    console.log(error);
    res.redirect("/blogs");
  }
    
})

app.listen(3000, () => {
  console.log("Server Running on Port 3000");
});
