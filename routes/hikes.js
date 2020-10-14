const express = require("express");
const router = express.Router();
const Hike = require("../models/hike");
const middleware = require("../middleware");

router.get("/", async (req, res) => {
  try {
    let foundHikes = await Hike.find({});
    res.render("hikes/index", { hikes: foundHikes });
  } catch (err) {
    console.log(err);
  }
});

// NEW renders a form
router.get("/new", middleware.isLoggedIn, middleware.isAdmin, (req, res) => {
  res.render("hikes/new");
});

// CREATE
router.post("/", middleware.isLoggedIn, middleware.isAdmin, async (req, res) => {
  try {
    let newHike = await Hike.create(req.body.hike);
    res.redirect("/hikes");
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
router.get("/:id/edit", middleware.isLoggedIn, middleware.isAdmin, async (req, res) => {
  try {
    let foundHike = await Hike.findById(req.params.id);
    res.render("hikes/edit", { hike: foundHike });
    if (!foundHike) {
      throw "Something Went WRONG!";
    }
  } catch (error) {
    console.log("Caught", error);
    res.redirect("/");
  }
});
// UPDATE
router.put("/:id", middleware.isLoggedIn, middleware.isAdmin, async (req, res) => {
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
// DESTROY
router.delete("/:id", middleware.isLoggedIn, middleware.isAdmin, async (req, res) => {
  try {
    let destroyedHike = await Hike.findByIdAndDelete(req.params.id);

    if (!destroyedHike) {
      throw "Oh No! Failed to delete Hike";
    } else {
      res.redirect("/hikes");
    }
  } catch (err) {
    console.log(err);
    res.redirect("/hikes");
  }
});

module.exports = router;
