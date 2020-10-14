const express = require("express");
const router = express.Router({ mergeParams: true });
const Hike = require("../models/hike");
const Comment = require("../models/comment");
const middleware = require("../middleware");

// comments new
router.get("/new", middleware.isLoggedIn, async (req, res) => {
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
router.post("/", middleware.isLoggedIn, (req, res) => {
  Hike.findById(req.params.id, (err, foundHike) => {
    if (err) {
      req.flash("error", "Hike Not Found");
      res.redirect("/hikes");
    } else {
      Comment.create(req.body.comment, (err, comment) => {
        if (err) {
          req.flash("error", "Something Went Wrong");
          res.redirect("back");
        } else {
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          comment.save();
          foundHike.comments.push(comment);
          foundHike.save();
          req.flash("success", "Comment Added");
          res.redirect("/hikes/" + foundHike._id);
        }
      });
    }
  });
});

// COMMENT EDIT
router.get(
  "/:comment_id/edit",
  middleware.checkCommentOwnership,
  async (req, res) => {
    let foundComment = await Comment.findById(req.params.comment_id);
    console.log(foundComment);
    if (!foundComment) {
      console.log("Fuck This");
    } else {
      res.render("comments/edit", {
        hike_id: req.params.id,
        comment: foundComment,
      });
    }
  }
);

router.put(
  "/:comment_id",
  middleware.checkCommentOwnership,
  async (req, res) => {
    try {
      let updatedComment = await Comment.findByIdAndUpdate(
        req.params.comment_id,
        req.body.comment
      );
      if (!updatedComment) {
        req.flash("error", "Something Went Wrong");
        res.redirect("back");
      } else {
        req.flash("success", "Comment Updated");
        res.redirect("/hikes/" + req.params.id);
      }
    } catch (err) {
      console.log(err);
      res.redirect("/hikes");
    }
  }
);

router.delete("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
  Comment.findByIdAndDelete(req.params.comment_id, (err) => {
    if (err) {
      res.redirect("back");
    } else {
      req.flash("success", "Comment deleted");
      res.redirect("/hikes/" + req.params.id);
    }
  });
});

module.exports = router;
