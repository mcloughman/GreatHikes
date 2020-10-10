const express = require("express");
const router = express.Router({ mergeParams: true });
const Hike = require("../models/hike");
const Comment = require("../models/comment");

// comments new
router.get("/new", isLoggedIn, async (req, res) => {
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

// comments create
router.post("/", isLoggedIn, (req, res) => {
  Hike.findById(req.params.id, (err, foundHike) => {
    if (err) {
      console.log(err);
      res.redirect("/hikes");
    } else {
      Comment.create(req.body.comment, (err, comment) => {
        if (err) {
          console.log(err);
        } else {
         comment.author.id = req.user._id;
         comment.author.username = req.user.username;
         comment.save();
          foundHike.comments.push(comment);
          foundHike.save();
          res.redirect("/hikes/" + foundHike._id);
        }
      });
    }
  });
});

// middleware
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

module.exports = router;
