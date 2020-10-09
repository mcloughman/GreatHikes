const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const axios = require("axios");
const Hike = require("./models/hike");
const Comment = require("./models/comment");
//const User = require("./models/user");

// APP CONFIG
const app = express();
mongoose
  .connect("mongodb://localhost:27017/birdproject", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));
mongoose.set("useFindAndModify", false);
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// ROUTES
// INDEX
app.get("/", (req, res) => {
  res.redirect("/hikes");
});

app.get("/hikes", async (req, res) => {
  try {
    let foundHikes = await Hike.find({});
    res.render("hikes/index", { hikes: foundHikes });
  } catch (err) {
    console.log(err);
  }
});

// NEW renders a form
app.get("/hikes/new", (req, res) => {
  res.render("hikes/new");
});

// CREATE
app.post("/hikes", async (req, res) => {
  try {
    let newHike = await Hike.create(req.body.hike);
    res.redirect("/hikes");
  } catch (err) {
    console.log(err);
  }
});

// SHOW
app.get("/hikes/:id", function (req, res) {
  Hike.findById(req.params.id)
    .populate("comments")
    .exec(function (err, foundHike) {
      if (err) {
        console.log(err);
      } else {
        console.log(foundHike);
        res.render("hikes/show", { hike: foundHike });
      }
    });
});
// EDIT
app.get("/hikes/:id/edit", async (req, res) => {
  try {
    let foundHike = await Hike.findById(req.params.id);
    res.render("edit", { hike: foundHike });
    if (!foundHike) {
      throw "Something Went WRONG!";
    }
  } catch (error) {
    console.log("Caught", error);
    res.redirect("/hikes");
  }
});
// UPDATE
app.put("/hikes/:id", async (req, res) => {
  try {
    let updatedHike = await Hike.findByIdAndUpdate(
      req.params.id,
      req.body.hike
    );
    res.redirect("/hikes/" + req.params.id);
    if (!updatedHike) {
      throw "Failed to Update Hike";
    }
  } catch (e) {
    console.log(e);
    res.redirect("/hikes");
  }
});

//************************
// COMMENT ROUTES
//************************
app.get("/hikes/:id/comments/new", async (req, res) => {
  try {
    let foundHike = await Hike.findById(req.params.id);
    res.render("comments/new", { hike: foundHike });
    if (!foundHike) {
      throw "Can't Find Hike";
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/hikes/:id/comments", (req, res) => {
  Hike.findById(req.params.id, (err, foundHike) => {
    if (err) {
      console.log(err);
      res.redirect("/hikes");
    } else {
      Comment.create(req.body.comment, (err, comment) => {
        if (err) {
          console.log(err);
        } else {
          foundHike.comments.push(comment);
          foundHike.save();
          res.redirect("/hikes/" + foundHike._id);
        }
      });
    }
  });
});

app.listen(3000, () => {
  console.log("Server Running on Port 3000");
});
