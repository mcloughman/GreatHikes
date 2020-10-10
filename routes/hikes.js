const express = require("express");
const router = express.Router();
const Hike = require("../models/hike");

router.get("/", async (req, res) => {
  try {
    let foundHikes = await Hike.find({});
    res.render("hikes/index", { hikes: foundHikes });
  } catch (err) {
    console.log(err);
  }
});

// NEW renders a form
router.get("/new", (req, res) => {
  res.render("hikes/new");
});

// CREATE
router.post("/", async (req, res) => {
  try {
    let newHike = await Hike.create(req.body.hike);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

// SHOW
router.get("/:id", function (req, res) {
  Hike.findById(req.params.id)
    .populate("comments")
    .exec(function (err, foundHike) {
      if (err) {
        console.log(err);
      } else {
        res.render("hikes/show", { hike: foundHike });
      }
    });
});
// EDIT
router.get("/:id/edit", async (req, res) => {
  try {
    let foundHike = await Hike.findById(req.params.id);
    res.render("edit", { hike: foundHike });
    if (!foundHike) {
      throw "Something Went WRONG!";
    }
  } catch (error) {
    console.log("Caught", error);
    res.redirect("/");
  }
});
// UPDATE
router.put("/:id", async (req, res) => {
  try {
    let updatedHike = await Hike.findByIdAndUpdate(
      req.params.id,
      req.body.hike
    );
    res.redirect("/" + req.params.id);
    if (!updatedHike) {
      throw "Failed to Update Hike";
    }
  } catch (e) {
    console.log(e);
    res.redirect("/");
  }
});
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

module.exports = router;
